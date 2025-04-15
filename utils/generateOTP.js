const genOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const otpExpires = () => Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

export { genOTP, otpExpires };
