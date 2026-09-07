<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $action === 'time_in' ? 'Arrival Notice' : 'Departure Notice' }}</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding:24px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0;">
                    <!-- Header -->
                    <tr>
                        <td style="background-color:#0f172a; padding:28px 32px;">
                            <p style="margin:0; color:#94a3b8; font-size:12px; letter-spacing:2px; text-transform:uppercase;">Aurelio Arago Memorial National High School</p>
                            <p style="margin:8px 0 0 0; color:#ffffff; font-size:20px; font-weight:bold;">Student Attendance Notification</p>
                        </td>
                    </tr>

                    <!-- Greeting -->
                    <tr>
                        <td style="padding:32px 32px 8px 32px;">
                            <p style="margin:0; color:#0f172a; font-size:16px;">
                                Dear
                                <strong>{{ $student->guardian_name ?: 'Guardian' }}</strong>,
                            </p>
                            <p style="margin:16px 0 0 0; color:#334155; font-size:14px; line-height:1.6;">
                                This is to formally notify you of your child's attendance status at
                                <strong>{{ $student->section?->gradeLevel?->name }} – {{ $student->section?->name }}</strong>
                                on <strong>{{ $date }}</strong>.
                            </p>
                        </td>
                    </tr>

                    <!-- Details card -->
                    <tr>
                        <td style="padding:24px 32px 0 32px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
                                <tr>
                                    <td style="padding:16px 20px; border-bottom:1px solid #e2e8f0;">
                                        <p style="margin:0; color:#64748b; font-size:11px; text-transform:uppercase; letter-spacing:1px;">Student</p>
                                        <p style="margin:4px 0 0 0; color:#0f172a; font-size:15px; font-weight:bold;">{{ $student->full_name }}</p>
                                    </td>
                                    <td style="padding:16px 20px; border-bottom:1px solid #e2e8f0;">
                                        <p style="margin:0; color:#64748b; font-size:11px; text-transform:uppercase; letter-spacing:1px;">LRN</p>
                                        <p style="margin:4px 0 0 0; color:#0f172a; font-size:15px; font-weight:bold;">{{ $student->lrn }}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:16px 20px;">
                                        <p style="margin:0; color:#64748b; font-size:11px; text-transform:uppercase; letter-spacing:1px;">{{ $action === 'time_in' ? 'Time of Arrival' : 'Time of Departure' }}</p>
                                        <p style="margin:4px 0 0 0; color:#0f172a; font-size:15px; font-weight:bold;">{{ $time }}</p>
                                    </td>
                                    <td style="padding:16px 20px;">
                                        <p style="margin:0; color:#64748b; font-size:11px; text-transform:uppercase; letter-spacing:1px;">Status</p>
                                        <p style="margin:4px 0 0 0; color:#0f172a; font-size:15px; font-weight:bold; text-transform:capitalize;">{{ $status }}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Closing -->
                    <tr>
                        <td style="padding:24px 32px 32px 32px;">
                            <p style="margin:0; color:#334155; font-size:14px; line-height:1.6;">
                                Should you have any questions or concerns regarding your child's attendance,
                                please do not hesitate to contact the school administration.
                            </p>
                            <p style="margin:20px 0 0 0; color:#334155; font-size:14px;">Thank you for your continued support.</p>
                            <p style="margin:20px 0 0 0; color:#0f172a; font-size:14px; font-weight:bold;">The AAMNHS Administration</p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color:#f8fafc; padding:16px 32px; border-top:1px solid #e2e8f0;">
                            <p style="margin:0; color:#94a3b8; font-size:12px; text-align:center;">
                                This is an automated message from the AAMNHS Attendance Monitoring System.<br>
                                Please do not reply to this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>