const RECIPIENT_SIG_IMG = (dataUrl: string) =>
  `<img src="${dataUrl}" alt="Recipient signature" class="agreement-signature-image" style="max-height:80px;max-width:240px;display:block;" />`;

const formatPreviewDate = () =>
  new Date().toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });

const EMPLOYEE_COLUMN_PATTERN = /Employee\s*\/\s*Contractor/i;
const EMPLOYER_COLUMN_PATTERN = /Employer\s*\/\s*Organization/i;
const PARTICIPANT_COLUMN_PATTERN =
  /Participant(?:\s*\/\s*Participant'?s?\s*(?:Representative|Representative))?/i;
const PROVIDER_COLUMN_PATTERN = /Provider\s*\/\s*Organization/i;
const SIGNATURE_SECTION_PATTERN = /agreement-signature-section/i;

function replaceAt(html: string, start: number, length: number, replacement: string) {
  return html.slice(0, start) + replacement + html.slice(start + length);
}

function isEmployerColumnText(text: string) {
  return (
    (EMPLOYER_COLUMN_PATTERN.test(text) || PROVIDER_COLUMN_PATTERN.test(text)) &&
    !EMPLOYEE_COLUMN_PATTERN.test(text) &&
    !PARTICIPANT_COLUMN_PATTERN.test(text)
  );
}

function isRecipientColumnText(text: string) {
  return (
    (EMPLOYEE_COLUMN_PATTERN.test(text) || PARTICIPANT_COLUMN_PATTERN.test(text)) &&
    /Signature:/i.test(text)
  );
}

function replaceSignatureLineContent(inner: string, img: string): string {
  const lineHtml = `<div class="agreement-signature-line">${img}</div>`;

  const lineDivRegex = /<div[^>]*class="[^"]*agreement-signature-line[^"]*"[^>]*>[\s\S]*?<\/div>/gi;
  const lineMatches = [...inner.matchAll(lineDivRegex)];
  if (lineMatches.length > 0) {
    const last = lineMatches[lineMatches.length - 1];
    if (last.index !== undefined) {
      return replaceAt(inner, last.index, last[0].length, lineHtml);
    }
  }

  const sigIdx = inner.search(/(?:Signature|Signed)\s*:/i);
  if (sigIdx === -1) return `${inner}${lineHtml}`;

  const afterSig = inner.slice(sigIdx);
  const paraMatch = afterSig.match(/<p[^>]*>[\s\S]*?<\/p>/i);
  if (paraMatch && paraMatch.index !== undefined) {
    const insertAt = sigIdx + paraMatch.index + paraMatch[0].length;
    return replaceAt(inner, insertAt, 0, lineHtml);
  }

  return `${inner}${lineHtml}`;
}

function updateTdInner(tdHtml: string, img: string): string | null {
  const openTag = tdHtml.match(/^<td\b[^>]*>/i)?.[0];
  if (!openTag) return null;
  const inner = tdHtml.slice(openTag.length, tdHtml.length - 5);
  const updatedInner = replaceSignatureLineContent(inner, img);
  return `${openTag}${updatedInner}</td>`;
}

function findRecipientTdInSignatureTable(tableHtml: string): RegExpExecArray | null {
  const tdRegex = /<td\b[^>]*>[\s\S]*?<\/td>/gi;
  const tds: RegExpExecArray[] = [];
  let tdMatch: RegExpExecArray | null = tdRegex.exec(tableHtml);
  while (tdMatch) {
    tds.push(tdMatch);
    tdMatch = tdRegex.exec(tableHtml);
  }

  const recipientTd = tds.find((td) => isRecipientColumnText(td[0]));
  if (recipientTd) return recipientTd;

  if (tds.length >= 2) {
    const second = tds[1];
    if (second && !isEmployerColumnText(second[0])) return second;
  }

  const nonEmployerTds = tds.filter((td) => !isEmployerColumnText(td[0]));
  return nonEmployerTds.length > 0 ? nonEmployerTds[nonEmployerTds.length - 1] : null;
}

function injectIntoSignatureTable(html: string, tableMatch: RegExpMatchArray, img: string): string | null {
  if (tableMatch.index === undefined) return null;

  const tableHtml = tableMatch[0];
  const recipientTd = findRecipientTdInSignatureTable(tableHtml);
  if (!recipientTd || recipientTd.index === undefined) return null;

  const updatedTd = updateTdInner(recipientTd[0], img);
  if (!updatedTd) return null;

  const updatedTable = replaceAt(tableHtml, recipientTd.index, recipientTd[0].length, updatedTd);
  const result = replaceAt(html, tableMatch.index, tableMatch[0].length, updatedTable);
  return updateRecipientDateInHtml(result, tableMatch.index);
}

function injectBySignatureSectionTable(html: string, img: string): string | null {
  const tableMatch = html.match(
    /<table[^>]*class="[^"]*agreement-signature-section[^"]*"[^>]*>[\s\S]*?<\/table>/i
  );
  if (!tableMatch) return null;
  return injectIntoSignatureTable(html, tableMatch, img);
}

function injectByEmployeeTable(html: string, img: string): string | null {
  const tableRegex =
    /<table[^>]*class="[^"]*agreement-signature-section[^"]*"[^>]*>[\s\S]*?Employee\s*\/\s*Contractor[\s\S]*?<\/table>/gi;
  let tableMatch: RegExpExecArray | null = tableRegex.exec(html);

  while (tableMatch) {
    const result = injectIntoSignatureTable(html, tableMatch, img);
    if (result) return result;
    tableMatch = tableRegex.exec(html);
  }

  return null;
}

function injectBySignedSection(html: string, img: string): string | null {
  const signedIdx = html.search(/Signed:\s*<\/p>/i);
  if (signedIdx === -1) return null;

  const slice = html.slice(signedIdx);
  const updated = replaceSignatureLineContent(slice, img);
  if (updated === slice) return null;

  const result = html.slice(0, signedIdx) + updated + html.slice(signedIdx + slice.length);
  return updateRecipientDateInHtml(result, signedIdx);
}

function findRecipientColumnInSignatureSection(root: ParentNode): Element | null {
  const section = root.querySelector(".agreement-signature-section");
  if (!section) return null;

  const sectionTds = section.querySelectorAll("td");
  for (const td of Array.from(sectionTds)) {
    if (isRecipientColumnText(td.textContent ?? "")) return td;
  }

  if (sectionTds.length >= 2) {
    return sectionTds[1];
  }

  return null;
}

function injectByDomParser(html: string, img: string): string | null {
  if (typeof DOMParser === "undefined") return null;

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="agreement-preview-root">${html}</div>`, "text/html");
  const root = doc.getElementById("agreement-preview-root");
  if (!root) return null;

  const recipientCol = findRecipientColumnInSignatureSection(root);
  if (!recipientCol) return null;

  let line = recipientCol.querySelector(".agreement-signature-line");
  if (!line) {
    line = doc.createElement("div");
    line.className = "agreement-signature-line";
    const sigParagraph = Array.from(recipientCol.querySelectorAll("p")).find((p) =>
      /(?:Signature|Signed)\s*:/i.test(p.textContent ?? "")
    );
    if (sigParagraph) {
      sigParagraph.insertAdjacentElement("afterend", line);
    } else {
      recipientCol.appendChild(line);
    }
  }

  line.innerHTML = img;
  updateRecipientDateInElement(recipientCol);
  return root.innerHTML;
}

function updateRecipientDateInElement(recipientCol: Element) {
  const date = formatPreviewDate();
  recipientCol.querySelectorAll("p").forEach((p) => {
    const text = (p.textContent ?? "").trim();
    if (/^Date:\s*$/i.test(text) || text === "Date:") {
      p.textContent = `Date: ${date}`;
    }
  });
}

function updateRecipientDateInHtml(html: string, fromIndex = 0): string {
  const date = formatPreviewDate();
  const slice = html.slice(fromIndex);
  const dateMatch = slice.match(/<p[^>]*>\s*Date:\s*<\/p>/i);
  if (dateMatch && dateMatch.index !== undefined) {
    const abs = fromIndex + dateMatch.index;
    return replaceAt(html, abs, dateMatch[0].length, `<p>Date: ${date}</p>`);
  }
  return html;
}

export function hasRecipientSignatureInHtml(html: string) {
  return (
    /alt="Recipient signature"[^>]*src="data:image/i.test(html) ||
    /src="data:image[^"]*"[^>]*alt="Recipient signature"/i.test(html)
  );
}

function recipientSignatureIsInSignatureSection(html: string): boolean {
  if (!hasRecipientSignatureInHtml(html)) return false;

  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
    const section = doc.querySelector(".agreement-signature-section");
    if (section) {
      return !!section.querySelector('img[alt="Recipient signature"]');
    }
  }

  const sectionIdx = html.search(SIGNATURE_SECTION_PATTERN);
  if (sectionIdx === -1) return false;

  const slice = html.slice(sectionIdx, sectionIdx + 6000);
  return /alt="Recipient signature"/i.test(slice);
}

/** Injects or updates the recipient signature in the designated signature block only. */
export function injectRecipientSignaturePreview(html: string, signatureDataUrl: string | null): string {
  if (!signatureDataUrl || !html) return html;

  const img = RECIPIENT_SIG_IMG(signatureDataUrl);

  if (html.includes("{{signature.recipient}}")) {
    return updateRecipientDateInHtml(
      html
        .replace(/\{\{signature\.recipient\}\}/g, img)
        .replace(/\{\{signature\.recipientDate\}\}/g, formatPreviewDate())
    );
  }

  if (hasRecipientSignatureInHtml(html) && recipientSignatureIsInSignatureSection(html)) {
    return html;
  }

  const injected =
    injectByDomParser(html, img) ??
    injectBySignatureSectionTable(html, img) ??
    injectByEmployeeTable(html, img) ??
    injectBySignedSection(html, img);

  if (!injected) return html;

  const sectionIdx = injected.search(SIGNATURE_SECTION_PATTERN);
  return updateRecipientDateInHtml(injected, sectionIdx === -1 ? 0 : sectionIdx);
}

export function isRecipientSignaturePreviewValid(html: string) {
  return recipientSignatureIsInSignatureSection(html);
}
