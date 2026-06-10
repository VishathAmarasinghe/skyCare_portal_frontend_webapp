const UNCHECKED = "☐";
const CHECKED = "☑";

const TICK_BUTTON =
  `<button type="button" class="agreement-tick" data-checked="0" aria-label="Toggle option">${UNCHECKED}</button>`;

/** Replace unicode tick boxes with interactive buttons for public signing. */
export function enhanceAgreementCheckboxes(html: string): string {
  if (!html) return html;
  return html.replace(/☐/g, TICK_BUTTON).replace(/☑/g, TICK_BUTTON.replace('data-checked="0"', 'data-checked="1"').replace(UNCHECKED, CHECKED));
}

export function serializeAgreementCheckboxes(root: ParentNode): string {
  if (typeof document === "undefined") return "";

  const container = document.createElement("div");
  container.innerHTML = (root as HTMLElement).innerHTML ?? "";

  container.querySelectorAll("button.agreement-tick").forEach((button) => {
    const checked = button.getAttribute("data-checked") === "1";
    button.replaceWith(document.createTextNode(checked ? CHECKED : UNCHECKED));
  });

  return container.innerHTML;
}

export function isYesNoGroup(buttons: HTMLButtonElement[]): boolean {
  if (buttons.length < 2) return false;
  return buttons.every((button) => {
    const label = (button.nextSibling?.textContent ?? "").trim();
    return /^(Yes|No)\b/i.test(label);
  });
}

export function applyAgreementTickToggle(button: HTMLButtonElement, root: ParentNode) {
  const willCheck = button.getAttribute("data-checked") !== "1";
  const paragraph = button.closest("p, td, li");

  if (paragraph && willCheck) {
    const siblings = Array.from(paragraph.querySelectorAll("button.agreement-tick")) as HTMLButtonElement[];
    if (isYesNoGroup(siblings)) {
      siblings.forEach((sibling) => {
        if (sibling !== button) {
          sibling.setAttribute("data-checked", "0");
          sibling.textContent = UNCHECKED;
        }
      });
    }
  }

  button.setAttribute("data-checked", willCheck ? "1" : "0");
  button.textContent = willCheck ? CHECKED : UNCHECKED;
}

export function stripInteractiveAgreementMarkup(html: string): string {
  if (!html) return html;
  return html
    .replace(/<button[^>]*class="[^"]*agreement-tick[^"]*"[^>]*data-checked="1"[^>]*>[\s\S]*?<\/button>/gi, CHECKED)
    .replace(/<button[^>]*class="[^"]*agreement-tick[^"]*"[^>]*>[\s\S]*?<\/button>/gi, UNCHECKED);
}
