export class PasswordRecoveryDto {
    readonly email: string;
    readonly newPassword: string;
    readonly confirmPassword: string;
}