/** Default two-column signature block inserted from the agreement template editor. */
export const DEFAULT_AGREEMENT_SIGNATURE_SECTION_HTML = `<table class="agreement-signature-section" style="width:100%;border-collapse:collapse;border:1px solid #000;margin:16px 0;">
<tbody>
<tr>
<td class="agreement-signature-column" style="width:50%;border:1px solid #000;padding:12px 14px;vertical-align:top;">
<p style="margin:0 0 14px;"><strong><u>Employer / Organization</u></strong></p>
<p style="margin:0 0 14px;">Name: {{org.directorName}}</p>
<p style="margin:0 0 14px;">Date: {{signature.adminDate}}</p>
<p style="margin:0 0 6px;">Signature:</p>
<div class="agreement-signature-line">{{signature.admin}}</div>
</td>
<td class="agreement-signature-column" style="width:50%;border:1px solid #000;padding:12px 14px;vertical-align:top;">
<p style="margin:0 0 14px;"><strong><u>Employee / Contractor</u></strong></p>
<p style="margin:0 0 14px;">Name: {{worker.fullName}}</p>
<p style="margin:0 0 14px;">Date: {{signature.recipientDate}}</p>
<p style="margin:0 0 6px;">Signature:</p>
<div class="agreement-signature-line">{{signature.recipient}}</div>
</td>
</tr>
</tbody>
</table>`;
