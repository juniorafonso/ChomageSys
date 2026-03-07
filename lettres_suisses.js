const SESSION_KEY = "lettresSuissesConfig";
let signatureImageData = null;

const fields = {
    firstName: document.getElementById("firstName"),
    lastName: document.getElementById("lastName"),
    appStreet: document.getElementById("appStreet"),
    appNpa: document.getElementById("appNpa"),
    appCity: document.getElementById("appCity"),
    phone: document.getElementById("phone"),
    email: document.getElementById("email"),
    recipientLine1: document.getElementById("recipientLine1"),
    recipientLine2: document.getElementById("recipientLine2"),
    recipientStreet: document.getElementById("recipientStreet"),
    recipientNpa: document.getElementById("recipientNpa"),
    recipientCity: document.getElementById("recipientCity"),
    annexe: document.getElementById("annexe"),
    concerne: document.getElementById("concerne"),
    letterDate: document.getElementById("letterDate"),
    letterContent: document.getElementById("letterContent"),
    signatureImage: document.getElementById("signatureImage"),
    preview: document.getElementById("preview"),
    sessionStatus: document.getElementById("sessionStatus")
};

const ui = {
    senderModal: document.getElementById("senderConfigModal"),
    recipientModal: document.getElementById("recipientConfigModal"),
    openSenderModalBtn: document.getElementById("openSenderModalBtn"),
    openRecipientModalBtn: document.getElementById("openRecipientModalBtn"),
    closeSenderModalBtn: document.getElementById("closeSenderModalBtn"),
    closeRecipientModalBtn: document.getElementById("closeRecipientModalBtn")
};

function openModal(modalElement) {
    modalElement.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeModal(modalElement) {
    modalElement.classList.remove("open");
    if (!ui.senderModal.classList.contains("open") && !ui.recipientModal.classList.contains("open")) {
        document.body.style.overflow = "";
    }
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

function getSenderConfig() {
    return {
        firstName: fields.firstName.value.trim(),
        lastName: fields.lastName.value.trim(),
        appStreet: fields.appStreet.value.trim(),
        appNpa: fields.appNpa.value.trim(),
        appCity: fields.appCity.value.trim(),
        phone: fields.phone.value.trim(),
        email: fields.email.value.trim()
    };
}

function getRecipientConfig() {
    return {
        recipientLine1: fields.recipientLine1.value.trim(),
        recipientLine2: fields.recipientLine2.value.trim(),
        recipientStreet: fields.recipientStreet.value.trim(),
        recipientNpa: fields.recipientNpa.value.trim(),
        recipientCity: fields.recipientCity.value.trim()
    };
}

function saveConfigToSession(showMessage = true) {
    const config = {
        ...getSenderConfig(),
        ...getRecipientConfig()
    };
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
        data.recipientLine1,
        data.concerne,
        data.letterDate,
        data.letterContent,
        data.annexe
    ];

    return required.some((item) => !item || item.trim() === "");
}

function buildLetterData() {
    const sender = getSenderConfig();
    const recipient = getRecipientConfig();
    const normalizedContent = fields.letterContent.value
        .replace(/\r\n/g, "\n")
        .replace(/\n+$/g, "");

    return {
        ...sender,
        ...recipient,
        concerne: fields.concerne.value.trim(),
        letterDate: fields.letterDate.value,
        letterContent: normalizedContent,
        annexe: fields.annexe.value.trim()
    };
}

function makePreviewText(data) {
    const fullName = `${data.firstName} ${data.lastName}`;
    const applicantCityDate = `${data.appCity}, le ${formatDateFr(data.letterDate)}`;
    const objet = data.concerne;

    const recipientBlock = [data.recipientLine1];
    if (data.recipientLine2) {
        recipientBlock.push(data.recipientLine2);
    }
    if (data.recipientStreet) {
        recipientBlock.push(data.recipientStreet);
    }
    if (data.recipientNpa || data.recipientCity) {
        recipientBlock.push(`${data.recipientNpa} ${data.recipientCity}`.trim());
    }

    return [
        fullName,
        data.appStreet,
        `${data.appNpa} ${data.appCity}`,
        data.phone,
        data.email,
        "",
        ...recipientBlock,
        "",
        applicantCityDate,
        "",
        objet,
        "",
        data.letterContent,
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

    const recipientBlock = [data.recipientLine1];
    if (data.recipientLine2) {
        recipientBlock.push(data.recipientLine2);
    }
    if (data.recipientStreet) {
        recipientBlock.push(data.recipientStreet);
    }
    if (data.recipientNpa || data.recipientCity) {
        recipientBlock.push(`${data.recipientNpa} ${data.recipientCity}`.trim());
    }

    recipientBlock.forEach((line) => {
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
    doc.text(data.concerne, marginLeft, y);
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

    const safeRecipient = data.recipientLine1.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "destinataire";
    doc.save(`lettres-suisses-${safeRecipient}.pdf`);
}

function refreshPreview() {
    const data = buildLetterData();
    fields.preview.textContent = makePreviewText(data);
}

function clearSessionAndConfig() {
    sessionStorage.removeItem(SESSION_KEY);
    [
        "firstName", "lastName", "appStreet", "appNpa", "appCity", "phone", "email",
        "recipientLine1", "recipientLine2", "recipientStreet", "recipientNpa", "recipientCity"
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

    document.getElementById("saveSenderBtn").addEventListener("click", () => {
        saveConfigToSession(true);
        refreshPreview();
    });

    document.getElementById("saveRecipientBtn").addEventListener("click", () => {
        saveConfigToSession(true);
        refreshPreview();
        closeModal(ui.recipientModal);
    });

    document.getElementById("clearSessionBtn").addEventListener("click", clearSessionAndConfig);
    document.getElementById("generatePdfBtn").addEventListener("click", generatePdf);
    fields.signatureImage.addEventListener("change", handleSignatureImageChange);
    ui.openSenderModalBtn.addEventListener("click", () => openModal(ui.senderModal));
    ui.openRecipientModalBtn.addEventListener("click", () => openModal(ui.recipientModal));
    ui.closeSenderModalBtn.addEventListener("click", () => closeModal(ui.senderModal));
    ui.closeRecipientModalBtn.addEventListener("click", () => closeModal(ui.recipientModal));

    [ui.senderModal, ui.recipientModal].forEach((modalElement) => {
        modalElement.addEventListener("click", (event) => {
            if (event.target === modalElement) {
                closeModal(modalElement);
            }
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeModal(ui.senderModal);
            closeModal(ui.recipientModal);
        }
    });

    [
        "firstName", "lastName", "appStreet", "appNpa", "appCity", "phone", "email",
        "recipientLine1", "recipientLine2", "recipientStreet", "recipientNpa", "recipientCity",
        "concerne", "letterDate", "letterContent"
    ].forEach((key) => {
        fields[key].addEventListener("input", () => {
            if ([
                "firstName", "lastName", "appStreet", "appNpa", "appCity", "phone", "email",
                "recipientLine1", "recipientLine2", "recipientStreet", "recipientNpa", "recipientCity"
            ].includes(key)) {
                saveConfigToSession(false);
            }
            refreshPreview();
        });
    });

    fields.annexe.addEventListener("input", refreshPreview);
}

init();
