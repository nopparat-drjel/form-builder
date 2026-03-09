interface EmailEnv {
  RESEND_API_KEY?: string;
  NOTIFY_EMAIL?: string;
}

interface SubmissionPayload {
  formTitle: string;
  applicantName?: string;
  applicantEmail?: string;
  responseId: string;
  submittedAt: number;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  });
}

function buildEmailHtml(payload: SubmissionPayload): string {
  const {
    formTitle,
    applicantName,
    applicantEmail,
    responseId,
    submittedAt,
  } = payload;

  const responsesUrl = "https://hr-form-staging.pages.dev/responses";

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ใบสมัครใหม่</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Sarabun',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

          <!-- Header banner -->
          <tr>
            <td style="background:#1a4d24;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.02em;">
                ใบสมัครใหม่ได้รับแล้ว
              </h1>
              <p style="margin:6px 0 0;color:#86efac;font-size:13px;">HR FormKit · ระบบรับสมัครงานออนไลน์</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <p style="margin:0 0 20px;font-size:15px;color:#374151;">
                มีใบสมัครงานใหม่สำหรับแบบฟอร์ม <strong style="color:#1a4d24;">${formTitle}</strong>
              </p>

              <!-- Info table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
                <tr>
                  <td style="padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px 8px 0 0;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">
                    แบบฟอร์ม
                  </td>
                  <td style="padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none;font-size:14px;color:#111827;">
                    ${formTitle}
                  </td>
                </tr>
                ${applicantName ? `<tr>
                  <td style="padding:10px 12px;background:#ffffff;border:1px solid #e5e7eb;border-top:none;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">
                    ชื่อผู้สมัคร
                  </td>
                  <td style="padding:10px 12px;background:#ffffff;border:1px solid #e5e7eb;border-top:none;font-size:14px;color:#111827;">
                    ${applicantName}
                  </td>
                </tr>` : ""}
                ${applicantEmail ? `<tr>
                  <td style="padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">
                    อีเมล
                  </td>
                  <td style="padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none;font-size:14px;color:#111827;">
                    ${applicantEmail}
                  </td>
                </tr>` : ""}
                <tr>
                  <td style="padding:10px 12px;background:#ffffff;border:1px solid #e5e7eb;border-top:none;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">
                    วันที่ส่ง
                  </td>
                  <td style="padding:10px 12px;background:#ffffff;border:1px solid #e5e7eb;border-top:none;font-size:14px;color:#111827;">
                    ${formatDate(submittedAt)}
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 0 8px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">
                    รหัสใบสมัคร
                  </td>
                  <td style="padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 0;font-size:12px;color:#6b7280;font-family:monospace;">
                    ${responseId}
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${responsesUrl}"
                       style="display:inline-block;background:#1a4d24;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 32px;border-radius:10px;letter-spacing:0.02em;">
                      ดูใบสมัคร
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:16px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                HR FormKit · ระบบรับสมัครงานออนไลน์
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:#d1d5db;">
                อีเมลนี้ส่งอัตโนมัติ กรุณาอย่าตอบกลับ
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendSubmissionNotification(
  env: EmailEnv,
  payload: SubmissionPayload
): Promise<void> {
  if (!env.RESEND_API_KEY || !env.NOTIFY_EMAIL) {
    return;
  }

  try {
    const fromAddress = env.RESEND_API_KEY.startsWith("re_test_")
      ? "onboarding@resend.dev"
      : "HR FormKit <notifications@hrformkit.com>";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [env.NOTIFY_EMAIL],
        subject: `ใบสมัครใหม่ - ${payload.formTitle}`,
        html: buildEmailHtml(payload),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[email] Resend API error", res.status, body);
    }
  } catch (err) {
    console.error("[email] Failed to send submission notification", err);
  }
}
