const { Resend } = require("resend");

// Initialize Resend instance
const resendApiKey = process.env.RESEND_API_KEY;
const resend = new Resend(resendApiKey || "re_placeholder_key");

/**
 * Sends an email using Resend API.
 * Supports both Promise/async and standard Node.js callback signatures.
 * 
 * @param {Object} options - Email options
 * @param {string} [options.from] - Sender email address (defaults to RESEND_FROM or onboarding@resend.dev)
 * @param {string|string[]} options.to - Recipient email address or list
 * @param {string} options.subject - Email subject line
 * @param {string} [options.html] - HTML content of the email
 * @param {string} [options.text] - Plain text content of the email
 * @param {Function} [callback] - Optional callback (error, data)
 */
async function sendMail(options, callback) {
    if (!process.env.RESEND_API_KEY) {
        const errorMsg = "⚠️ [Resend] RESEND_API_KEY is not defined in server/.env. Please configure your Resend API key to deliver emails.";
        console.warn(errorMsg);
        const err = new Error(errorMsg);
        if (typeof callback === "function") callback(err, null);
        return { data: null, error: err };
    }

    const from =
        options.from ||
        process.env.RESEND_FROM ||
        process.env.MAIL_SENDER ||
        "Tastora <onboarding@resend.dev>";

    const to = Array.isArray(options.to) ? options.to : [options.to];

    try {
        const response = await resend.emails.send({
            from,
            to,
            subject: options.subject || "Notification from Tastora",
            html: options.html,
            text: options.text,
        });

        if (response.error) {
            console.error("❌ [Resend Error]:", response.error);
            if (typeof callback === "function") callback(response.error, null);
            return response;
        }

        console.log("✅ [Resend Success] Email sent ID:", response.data?.id);
        if (typeof callback === "function") callback(null, response.data);
        return response;
    } catch (err) {
        console.error("❌ [Resend Exception]:", err.message);
        if (typeof callback === "function") callback(err, null);
        return { data: null, error: err };
    }
}

module.exports = {
    resend,
    sendMail,
};
