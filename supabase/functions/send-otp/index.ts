import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { contact, method } = await req.json();

    if (!contact || !method) {
      return new Response(
        JSON.stringify({ error: "Missing contact or method" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const { error: dbError } = await supabase
      .from("otp_verifications")
      .insert([{
        contact,
        otp_code: otp,
        method,
        expires_at: expiresAt.toISOString(),
        verified: false,
      }]);

    if (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }

    if (method === "email") {
      const sgApiKey = Deno.env.get("SENDGRID_API_KEY");
      if (sgApiKey) {
        const emailResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${sgApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: contact }] }],
            from: { email: "noreply@yourdomain.com", name: "Your App" },
            subject: "Your Verification Code",
            content: [{
              type: "text/html",
              value: `<p>Your verification code is: <strong>${otp}</strong></p><p>This code will expire in 5 minutes.</p>`,
            }],
          }),
        });

        if (!emailResponse.ok) {
          console.error("SendGrid error:", await emailResponse.text());
        }
      } else {
        console.log(`Email OTP for ${contact}: ${otp}`);
      }
    } else if (method === "mobile") {
      const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
      const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
      const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

      if (twilioSid && twilioToken && twilioPhone) {
        const formBody = new URLSearchParams({
          To: `+91${contact}`,
          From: twilioPhone,
          Body: `Your verification code is: ${otp}. Valid for 5 minutes.`,
        });

        const smsResponse = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
          {
            method: "POST",
            headers: {
              "Authorization": `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formBody.toString(),
          }
        );

        if (!smsResponse.ok) {
          console.error("Twilio error:", await smsResponse.text());
        }
      } else {
        console.log(`SMS OTP for ${contact}: ${otp}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `OTP sent to ${contact}`,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});