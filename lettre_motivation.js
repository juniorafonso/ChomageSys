const SESSION_KEY = "lettreMotivationConfig";
let signatureImageData = null;

const fields = {
    firstName: document.getElementById("firstName"),
    lastName: document.getElementById("lastName"),
    appStreet: document.getElementById("appStreet"),
    appNpa: document.getElementById("appNpa"),
    appCity: document.getElementById("appCity"),
    phone: document.getElementById("phone"),
    email: document.getElementById("email"),
    closingParagraph: document.getElementById("closingParagraph"),
    annexe: document.getElementById("annexe"),
    companyName: document.getElementById("companyName"),
    jobTitle: document.getElementById("jobTitle"),
    letterDate: document.getElementById("letterDate"),
    companyStreet: document.getElementById("companyStreet"),
    companyNpa: document.getElementById("companyNpa"),
    companyCity: document.getElementById("companyCity"),
    letterContent: document.getElementById("letterContent"),
    signatureImage: document.getElementById("signatureImage"),
    preview: document.getElementById("preview"),
    sessionStatus: document.getElementById("sessionStatus")
};

const ui = {
    configModal: document.getElementById("applicantConfigModal"),
    openConfigModalBtn: document.getElementById("openConfigModalBtn"),
    closeConfigModalBtn: document.getElementById("closeConfigModalBtn"),
    companyAddressSection: document.getElementById("companyAddressSection"),
    toggleCompanyAddressBtn: document.getElementById("toggleCompanyAddressBtn"),
    toggleCompanyAddressText: document.getElementById("toggleCompanyAddressText")
};

function openConfigModal() {
    ui.configModal.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeConfigModal() {
    ui.configModal.classList.remove("open");
    document.body.style.overflow = "";
}

function toggleCompanyAddressSection() {
    const isCollapsed = ui.companyAddressSection.classList.toggle("is-collapsed");
    ui.toggleCompanyAddressText.textContent = isCollapsed ? "Afficher" : "Masquer";
    ui.toggleCompanyAddressBtn.setAttribute("aria-expanded", String(!isCollapsed));
}

function getImageFormatFromMime(mimeType) {
    if (mimeType === "image/png") return "PNG";
    if (mimeType === "image/jpeg" || mimeType === "image/jpg") return "JPEG";
    return null;
}

function loadImageDimensions(dataUrl) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve({ width: image.width, height: image.height });
        image.onerror = () => reject(new Error("Impossible de lire l'image de signature."));
        image.src = dataUrl;
    });
}

function handleSignatureImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
        signatureImageData = null;
        return;
    }

    const format = getImageFormatFromMime(file.type);
    if (!format) {
        signatureImageData = null;
        fields.signatureImage.value = "";
        alert("Format non supporté. Veuillez utiliser PNG ou JPG/JPEG.");
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        signatureImageData = {
            dataUrl: reader.result,
            format
        };
    };
    reader.onerror = () => {
        signatureImageData = null;
        fields.signatureImage.value = "";
        alert("Impossible de charger l'image de signature.");
    };
    reader.readAsDataURL(file);
}

function todayISO() {
    return new Date().toISOString().split("T")[0];
}

function monthFr(monthIndex) {
    const months = [
        "janvier", "février", "mars", "avril", "mai", "juin",
        "juillet", "août", "septembre", "octobre", "novembre", "décembre"
    ];
    return months[monthIndex];
}

function formatDateFr(isoDate) {
    if (!isoDate) return "";
    const date = new Date(`${isoDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "";
    const day = date.getDate();
    const month = monthFr(date.getMonth());
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

function getApplicantConfig() {
    return {
        firstName: fields.firstName.value.trim(),
        lastName: fields.lastName.value.trim(),
        appStreet: fields.appStreet.value.trim(),
        appNpa: fields.appNpa.value.trim(),
        appCity: fields.appCity.value.trim(),
        phone: fields.phone.value.trim(),
        email: fields.email.value.trim(),
        closingParagraph: fields.closingParagraph.value.trim(),
        annexe: fields.annexe.value.trim()
    };
}

function saveConfigToSession(showMessage = true) {
    const config = getApplicantConfig();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(config));
    if (showMessage) {
        fields.sessionStatus.textContent = "Configuration enregistrée dans la session.";
        setTimeout(() => {
            fields.sessionStatus.textContent = "";
        }, 2200);
    }
}

function loadConfigFromSession() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return;

    try {
        const config = JSON.parse(raw);
        Object.keys(config).forEach((key) => {
            if (fields[key]) {
                fields[key].value = config[key] || "";
            }
        });
    } catch {
        sessionStorage.removeItem(SESSION_KEY);
    }
}

function requiredMissing(data) {
    const required = [
        data.firstName,
        data.lastName,
        data.appStreet,
        data.appNpa,
        data.appCity,
        data.phone,
        data.email,
        data.closingParagraph,
        data.annexe,
        data.companyName,
        data.jobTitle,
        data.letterDate,
        data.letterContent
    ];

    return required.some((item) => !item || item.trim() === "");
}

function buildLetterData() {
    const applicant = getApplicantConfig();
    const normalizedContent = fields.letterContent.value
        .replace(/\r\n/g, "\n")
        .replace(/\n+$/g, "");

    return {
        ...applicant,
        companyName: fields.companyName.value.trim(),
        jobTitle: fields.jobTitle.value.trim(),
        letterDate: fields.letterDate.value,
        companyStreet: fields.companyStreet.value.trim(),
        companyNpa: fields.companyNpa.value.trim(),
        companyCity: fields.companyCity.value.trim(),
        letterContent: normalizedContent
    };
}

function makePreviewText(data) {
    const fullName = `${data.firstName} ${data.lastName}`;
    const applicantCityDate = `${data.appCity}, le ${formatDateFr(data.letterDate)}`;
    const objet = `Candidature pour le poste ${data.jobTitle}`;

    const companyAddressLine = data.companyStreet || data.companyNpa || data.companyCity
        ? `${data.companyStreet} ${data.companyNpa} ${data.companyCity}`.trim()
        : "";

    return [
        fullName,
        data.appStreet,
        `${data.appNpa} ${data.appCity}`,
        data.phone,
        data.email,
        "",
        data.companyName,
        "Ressources humaines",
        companyAddressLine,
        "",
        applicantCityDate,
        "",
        objet,
        "",
        data.letterContent,
        "",
        data.closingParagraph,
        "",
        fullName,
        "",
        `Annexe: ${data.annexe}`
    ].filter((line, index, arr) => !(line === "" && arr[index - 1] === "")).join("\n");
}

function ensurePageSpace(doc, currentY, requiredHeight, top, bottom) {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (currentY + requiredHeight > pageHeight - bottom) {
        doc.addPage();
        return top;
    }
    return currentY;
}

function wrapTextGreedy(doc, text, maxWidth) {
    const normalized = String(text || "").replace(/\s+/g, " ").trim();
    if (!normalized) return [];

    const widthTolerance = 1.2;
    const widthCompensationFactor = 0.985;

    const words = normalized.split(" ");
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const candidate = `${currentLine} ${words[i]}`;
        const candidateWidth = doc.getTextWidth(candidate) * widthCompensationFactor;
        if (candidateWidth <= maxWidth + widthTolerance) {
            currentLine = candidate;
        } else {
            lines.push(currentLine);
            currentLine = words[i];
        }
    }

    lines.push(currentLine);

    for (let i = 0; i < lines.length - 1; i++) {
        while (true) {
            const nextWords = lines[i + 1].split(" ").filter(Boolean);
            if (nextWords.length === 0) {
                break;
            }

            const movedWord = nextWords[0];
            const candidate = `${lines[i]} ${movedWord}`;
            const candidateWidth = doc.getTextWidth(candidate) * widthCompensationFactor;

            if (candidateWidth <= maxWidth + widthTolerance) {
                lines[i] = candidate;
                nextWords.shift();
                lines[i + 1] = nextWords.join(" ");
                if (!lines[i + 1]) {
                    lines.splice(i + 1, 1);
                    break;
                }
            } else {
                break;
            }
        }
    }

    return lines;
}

function drawJustifiedParagraph(doc, text, x, y, maxWidth, lineHeight, top, bottom, justifyAllLines = false) {
    const lines = wrapTextGreedy(doc, text, maxWidth);

    for (let i = 0; i < lines.length; i++) {
        y = ensurePageSpace(doc, y, lineHeight, top, bottom);
        const line = String(lines[i]).trim();
        const isLastLine = i === lines.length - 1;

        const shouldJustify = line.includes(" ") && (justifyAllLines || !isLastLine);
        if (shouldJustify) {
            const words = line.split(/\s+/);
            const gaps = words.length - 1;
            const lineWidth = doc.getTextWidth(line);
            const extraSpace = Math.max(0, maxWidth - lineWidth);
            const baseSpaceWidth = doc.getTextWidth(" ");
            const maxExtraPerGap = baseSpaceWidth * 0.6;

            if (gaps <= 0) {
                doc.text(line, x, y);
                y += lineHeight;
                continue;
            }

            if ((extraSpace / gaps) > maxExtraPerGap) {
                doc.text(line, x, y);
                y += lineHeight;
                continue;
            }

            let cursorX = x;
            const gapWidth = baseSpaceWidth + (extraSpace / gaps);
            words.forEach((word, index) => {
                doc.text(word, cursorX, y);
                const increment = doc.getTextWidth(word) + (index < gaps ? gapWidth : 0);
                cursorX += increment;
            });
        } else {
            doc.text(line, x, y);
        }

        y += lineHeight;
    }

    return y;
}

async function generatePdf() {
    saveConfigToSession(false);
    const data = buildLetterData();

    if (requiredMissing(data)) {
        alert("Veuillez remplir tous les champs obligatoires avant de générer le PDF.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    const marginLeft = 30;
    const marginRight = 20;
    const marginTop = 20;
    const marginBottom = 20;
    const maxWidth = 210 - marginLeft - marginRight;
    const lineHeight = 4.5;
    const recipientX = 100;
    const recipientMinY = 50;
    const dateX = 100;

    let y = marginTop;
    const fullName = `${data.firstName} ${data.lastName}`;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const topBlock = [
        fullName,
        data.appStreet,
        `${data.appNpa} ${data.appCity}`,
        data.phone,
        data.email
    ];

    topBlock.forEach((line) => {
        y = ensurePageSpace(doc, y, lineHeight, marginTop, marginBottom);
        doc.text(line, marginLeft, y);
        y += lineHeight;
    });

    y = Math.max(y, recipientMinY);

    const companyBlock = [data.companyName, "Ressources humaines"];
    if (data.companyStreet || data.companyNpa || data.companyCity) {
        companyBlock.push(`${data.companyStreet} ${data.companyNpa} ${data.companyCity}`.trim());
    }

    companyBlock.forEach((line) => {
        y = ensurePageSpace(doc, y, lineHeight, marginTop, marginBottom);
        doc.text(line, recipientX, y);
        y += lineHeight;
    });

    y += 2 * lineHeight;

    const dateLine = `${data.appCity}, le ${formatDateFr(data.letterDate)}`;
    y = ensurePageSpace(doc, y, lineHeight, marginTop, marginBottom);
    doc.text(dateLine, dateX, y);
    y += 3 * lineHeight;

    doc.setFont("helvetica", "bold");
    y = ensurePageSpace(doc, y, lineHeight, marginTop, marginBottom);
    doc.text(`Candidature pour le poste ${data.jobTitle}`, marginLeft, y);
    y += 3 * lineHeight;

    doc.setFont("helvetica", "normal");

    const contentParagraphs = data.letterContent
        .split(/\n\s*\n/g)
        .map((paragraph) => paragraph.replace(/\n+/g, " ").replace(/\s+/g, " ").trim())
        .filter(Boolean);

    contentParagraphs.forEach((paragraph, index) => {
        y = drawJustifiedParagraph(doc, paragraph, marginLeft, y, maxWidth, lineHeight, marginTop, marginBottom);
        if (index < contentParagraphs.length - 1) {
            y += lineHeight;
        }
    });

    y += lineHeight;
    y = drawJustifiedParagraph(doc, data.closingParagraph, marginLeft, y, maxWidth, lineHeight, marginTop, marginBottom);

    const signatureGap = signatureImageData?.dataUrl ? lineHeight : 4 * lineHeight;
    y += signatureGap;

    if (signatureImageData?.dataUrl) {
        try {
            const dimensions = await loadImageDimensions(signatureImageData.dataUrl);
            const maxSignatureWidth = 45;
            const maxSignatureHeight = 18;
            let signatureWidth = maxSignatureWidth;
            let signatureHeight = maxSignatureHeight;
            const imageRatio = dimensions.width / dimensions.height;
            const boxRatio = maxSignatureWidth / maxSignatureHeight;

            if (imageRatio > boxRatio) {
                signatureHeight = signatureWidth / imageRatio;
            } else {
                signatureWidth = signatureHeight * imageRatio;
            }

            y = ensurePageSpace(doc, y, signatureHeight + lineHeight + 1, marginTop, marginBottom);
            doc.addImage(signatureImageData.dataUrl, signatureImageData.format, dateX, y, signatureWidth, signatureHeight, undefined, "FAST");
            y += signatureHeight + 1;
        } catch {
            // Se a imagem falhar, o PDF continua apenas com o nome.
        }
    }

    y = ensurePageSpace(doc, y, lineHeight, marginTop, marginBottom);
    doc.text(fullName, dateX, y);

    const pageHeight = doc.internal.pageSize.getHeight();
    const footerY = pageHeight - marginBottom;
    doc.setFont("helvetica", "bold");
    doc.text(`Annexe: ${data.annexe}`, marginLeft, footerY);
    doc.setFont("helvetica", "normal");

    const safeCompany = data.companyName.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "entreprise";
    doc.save(`lettre-motivation-${safeCompany}.pdf`);
}

function refreshPreview() {
    const data = buildLetterData();
    fields.preview.textContent = makePreviewText(data);
}

function clearSessionAndConfig() {
    sessionStorage.removeItem(SESSION_KEY);
    [
        "firstName", "lastName", "appStreet", "appNpa", "appCity", "phone", "email", "closingParagraph", "annexe"
    ].forEach((key) => {
        fields[key].value = "";
    });
    fields.signatureImage.value = "";
    signatureImageData = null;
    fields.sessionStatus.textContent = "Session effacée.";
    setTimeout(() => {
        fields.sessionStatus.textContent = "";
    }, 1800);
    refreshPreview();
}

function init() {
    fields.letterDate.value = todayISO();
    loadConfigFromSession();
    refreshPreview();

    document.getElementById("saveConfigBtn").addEventListener("click", () => {
        saveConfigToSession(true);
        refreshPreview();
    });

    document.getElementById("clearSessionBtn").addEventListener("click", clearSessionAndConfig);
    document.getElementById("generatePdfBtn").addEventListener("click", generatePdf);
    fields.signatureImage.addEventListener("change", handleSignatureImageChange);
    ui.openConfigModalBtn.addEventListener("click", openConfigModal);
    ui.closeConfigModalBtn.addEventListener("click", closeConfigModal);
    ui.toggleCompanyAddressBtn.addEventListener("click", toggleCompanyAddressSection);
    ui.configModal.addEventListener("click", (event) => {
        if (event.target === ui.configModal) {
            closeConfigModal();
        }
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && ui.configModal.classList.contains("open")) {
            closeConfigModal();
        }
    });

    [
        "firstName", "lastName", "appStreet", "appNpa", "appCity", "phone", "email", "closingParagraph", "annexe",
        "companyName", "jobTitle", "letterDate", "companyStreet", "companyNpa", "companyCity", "letterContent"
    ].forEach((key) => {
        fields[key].addEventListener("input", () => {
            if (["firstName", "lastName", "appStreet", "appNpa", "appCity", "phone", "email", "closingParagraph", "annexe"].includes(key)) {
                saveConfigToSession(false);
            }
            refreshPreview();
        });
    });
}

init();
