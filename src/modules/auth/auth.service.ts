import { ApiError } from "../../utils/http.js";
import type { UserDatabase } from "../user/user.database.js";
import type { AuthDatabase } from "./auth.database.js";
import { verifyPassword } from "../../utils/crypto.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import { env } from "../../config/env.js";
import type { RefreshTokenDoc } from "./auth.model.js";

function randomTokenId(): string {
  return crypto.randomUUID();
}

export class AuthService {
  constructor(
    private readonly userDb: UserDatabase,
    private readonly authDb: AuthDatabase
  ) {}

  async login(input: {
    email: string;
    password: string;
    userAgent?: string;
    ip?: string;
  }) {
    const email = input.email.trim().toLowerCase();
    const user = await this.userDb.findByEmail(email);
    if (!user) throw new ApiError(400, { message: "Invalid Email" });

    const ok = await verifyPassword(input.password, user.passwordHash);
    if (!ok) throw new ApiError(401, { message: "Invalid Password" });

    const accessToken = signAccessToken({
      sub: user._id.toString(),
      role: user.role,
    });

    const tokenId = randomTokenId();
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + env.refreshTokenTtlSeconds * 1000
    );

    const doc: RefreshTokenDoc = {
      userId: user._id,
      tokenId,
      issuedAt: now,
      expiresAt,
      ...(input.userAgent !== undefined ? { userAgent: input.userAgent } : {}),
      ...(input.ip !== undefined ? { ip: input.ip } : {}),
    };

    await this.authDb.insert(doc);
    const refreshToken = signRefreshToken({
      sub: user._id.toString(),
      jti: tokenId,
    });
    return { accessToken, refreshToken };
  }

  async logout(refreshToken: string) {
    let payload: { sub: string; jti: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return;
    }
    await this.authDb.revoke(payload.jti);
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; jti: string };

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(401, { message: "Invalid or Expired Refresh Token" });
    }

    const active = await this.authDb.findActiveByTokenId(payload.jti);

    if (!active) {
      throw new ApiError(401, {
        message: "Refresh token not found or Already Revoked",
      });
    }

    const user = await this.userDb.findById(payload.sub);
    if (!user) {
      throw new ApiError(401, { message: "User is no longer existed" });
    }

    const newTokenId = randomTokenId();
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + env.refreshTokenTtlSeconds * 1000
    );

    const doc: RefreshTokenDoc = {
      userId: user._id,
      tokenId: newTokenId,
      issuedAt: now,
      expiresAt,
      ...(active.userAgent !== undefined
        ? { userAgent: active.userAgent }
        : {}),
      ...(active.ip !== undefined ? { ip: active.ip } : {}),
    };

    // BTVN: Viết function helper để tách những đoạn code bị duplicated.

    await this.authDb.insert(doc);
    await this.authDb.revoke(payload.jti, newTokenId);

    const accessToken = signAccessToken({
      sub: user._id.toString(),
      role: user.role,
    });

    const newRefreshToken = signRefreshToken({
      sub: user._id.toString(),
      jti: newTokenId,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }
}
