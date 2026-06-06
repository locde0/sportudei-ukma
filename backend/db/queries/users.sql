-- name: GetUserByEmail :one
SELECT id, email, password_hash, otp_code, otp_expires_at
FROM users
WHERE email = $1 LIMIT 1;

-- name: UpdateUserOTP :exec
UPDATE users
SET otp_code = $2, otp_expires_at = $3
WHERE email = $1;

-- name: ClearUserOTP :exec
UPDATE users
SET otp_code = NULL, otp_expires_at = NULL
WHERE email = $1;