// Discord Webhook URLs
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1456613398044344463/OVomRV3lZHDi6T_yg3qOJj4FMx755Miprb7SZsqTQmWob2nyXn32AuDjOe4Dcnjiblyi';
const BILLBOARD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1458080618976903412/NXuNd2tNOUtIZ4CtniTmDH-xIKI1_ALuy-bsPMBr4wqB4jhskRWAN4sr4q4sxE5xYREV'; // Replace with the actual Billboard webhook URL

let uploadedImageFile = null;

// Set current year in footer
document.addEventListener('DOMContentLoaded', function () {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) yearElement.textContent = new Date().getFullYear();
});

// Navigation functions
function showNewspaperAds() {
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('newspaper-page').style.display = 'block';
    document.getElementById('billboard-page').style.display = 'none';
}

function showBillboards() {
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('newspaper-page').style.display = 'none';
    document.getElementById('billboard-page').style.display = 'block';
}

function backToHome() {
    document.getElementById('landing-page').style.display = 'block';
    document.getElementById('newspaper-page').style.display = 'none';
    document.getElementById('billboard-page').style.display = 'none';

    document.getElementById('advertisementForm').reset();
    document.getElementById('billboardForm').reset();

    // Reset toggle fields
    toggleAdNameFields('newspaper');
    toggleAdNameFields('billboard');

    document.getElementById('filePreview').style.display = 'none';
    document.getElementById('bb_filePreview').style.display = 'none';
    uploadedImageFile = null;
    uploadedBillboardImage = null;
}

function toggleAdNameFields(formType) {
    if (formType === 'newspaper') {
        const adType = document.getElementById('adType').value;
        const businessContainer = document.getElementById('businessNameContainer');
        const communityContainer = document.getElementById('communityNameContainer');
        const businessSelect = document.getElementById('businessName');
        const communitySelect = document.getElementById('communityName');

        if (adType === 'Business') {
            businessContainer.style.display = 'block';
            communityContainer.style.display = 'none';
            businessSelect.required = true;
            communitySelect.required = false;
        } else {
            businessContainer.style.display = 'none';
            communityContainer.style.display = 'block';
            businessSelect.required = false;
            communitySelect.required = true;
        }
    } else if (formType === 'billboard') {
        const adType = document.getElementById('bb_adType').value;
        const businessContainer = document.getElementById('bb_businessNameContainer');
        const communityContainer = document.getElementById('bb_communityNameContainer');
        const businessSelect = document.getElementById('bb_businessName');
        const communitySelect = document.getElementById('bb_communityName');

        if (adType === 'Business') {
            businessContainer.style.display = 'block';
            communityContainer.style.display = 'none';
            businessSelect.required = true;
            communitySelect.required = false;
        } else {
            businessContainer.style.display = 'none';
            communityContainer.style.display = 'block';
            businessSelect.required = false;
            communitySelect.required = true;
        }
    }
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 20 * 1024 * 1024) {
            alert('File size must be less than 20MB');
            e.target.value = '';
            return;
        }

        uploadedImageFile = file;

        // Show preview for images only
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (event) {
                document.getElementById('previewImage').src = event.target.result;
                document.getElementById('previewImage').style.display = 'block';
                document.getElementById('fileName').textContent = file.name;
                document.getElementById('filePreview').style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            document.getElementById('previewImage').style.display = 'none';
            document.getElementById('fileName').textContent = file.name;
            document.getElementById('filePreview').style.display = 'block';
        }
    }
}

async function submitAdvertisement(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Uploading...';

    // Generate Application ID (Sequential)
    let currentAppId = parseInt(localStorage.getItem('tnma_app_count') || '0');
    let newAppId = currentAppId + 1;
    localStorage.setItem('tnma_app_count', newAppId.toString());

    const adType = document.getElementById('adType').value;
    const businessName = document.getElementById('businessName').value;
    const communityName = document.getElementById('communityName').value;

    const application = {
        id: '#' + newAppId,
        type: 'Newspaper',
        adType: adType,
        inGameName: document.getElementById('inGameName').value,
        inGamePhone: document.getElementById('inGamePhone').value,
        discordName: document.getElementById('discordName').value,
        selectedName: adType === 'Business' ? businessName : communityName,
        adSize: document.getElementById('adSize').value,
        duration: document.getElementById('duration').value + ' days',
        content: document.getElementById('adContent').value,
        notes: document.getElementById('adNotes').value,
        imageFile: uploadedImageFile,
        status: 'pending',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    };

    // Send to Discord with timeout
    const discordSent = await sendToDiscordWithTimeout(application, DISCORD_WEBHOOK_URL, 30000); // 30 second timeout

    if (discordSent) {
        showMessage('success', `✅ Application ${application.id} submitted successfully! We will contact you within 24 hours.`);
    } else {
        showMessage('error', '⚠️ Submission may have failed. Please contact us directly or try again.');
    }

    // Reset form
    document.getElementById('advertisementForm').reset();
    document.getElementById('filePreview').style.display = 'none';
    uploadedImageFile = null;

    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Application';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- BILLBOARD FUNCTIONS ----
let uploadedBillboardImage = null;

function handleBillboardFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 20 * 1024 * 1024) {
            alert('File size must be less than 20MB');
            e.target.value = '';
            return;
        }

        uploadedBillboardImage = file;
        const reader = new FileReader();
        reader.onload = function (event) {
            document.getElementById('bb_previewImage').src = event.target.result;
            document.getElementById('bb_previewImage').style.display = 'block';
            document.getElementById('bb_fileName').textContent = file.name;
            document.getElementById('bb_filePreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

async function submitBillboardAdvertisement(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('bb_submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Uploading...';

    let currentAppId = parseInt(localStorage.getItem('tnma_app_count') || '0');
    let newAppId = currentAppId + 1;
    localStorage.setItem('tnma_app_count', newAppId.toString());

    const adType = document.getElementById('bb_adType').value;
    const businessName = document.getElementById('bb_businessName').value;
    const communityName = document.getElementById('bb_communityName').value;

    const application = {
        id: '#' + newAppId,
        type: 'Billboard',
        adType: adType,
        inGameName: document.getElementById('bb_inGameName').value,
        inGamePhone: document.getElementById('bb_inGamePhone').value,
        discordName: document.getElementById('bb_discordName').value,
        selectedName: adType === 'Business' ? businessName : communityName,
        adSize: document.getElementById('bb_adSize').value,
        duration: document.getElementById('bb_duration').value + ' weeks',
        content: document.getElementById('bb_adContent').value,
        notes: document.getElementById('bb_adNotes').value,
        imageFile: uploadedBillboardImage,
        status: 'pending',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    };

    const discordSent = await sendToDiscordWithTimeout(application, BILLBOARD_WEBHOOK_URL, 30000);

    if (discordSent) {
        showMessage('success', `✅ Billboard Application ${application.id} submitted successfully!`);
    } else {
        showMessage('error', '⚠️ Submission may have failed. Please contact us directly.');
    }

    document.getElementById('billboardForm').reset();
    document.getElementById('bb_filePreview').style.display = 'none';
    uploadedBillboardImage = null;

    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Application';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- ADMIN FUNCTIONS ----

// Check State on Load
document.addEventListener('DOMContentLoaded', function () {
    checkBillboardState();
});

function openAdminPanel() {
    document.getElementById('admin-panel').style.display = 'flex';

    // Check if logged in
    const isLoggedIn = sessionStorage.getItem('tnma_admin_session') === 'true';

    if (isLoggedIn) {
        showAdminControls();
    } else {
        showAdminLogin();
    }
}

function showAdminLogin() {
    document.getElementById('admin-login-view').style.display = 'block';
    document.getElementById('admin-controls-view').style.display = 'none';
    document.getElementById('admin-discord-id-input').value = '';
    document.getElementById('login-error').style.display = 'none';
}

function showAdminControls() {
    document.getElementById('admin-login-view').style.display = 'none';
    document.getElementById('admin-controls-view').style.display = 'block';
    updateAdminStatusText();
}

function checkAdminDiscordId() {
    const input = document.getElementById('admin-discord-id-input').value.trim();
    const authorizedDiscordId = '841693897183723550';
    // Check if the entered Discord ID matches the authorized ID
    if (input === authorizedDiscordId) {
        sessionStorage.setItem('tnma_admin_session', 'true');
        showAdminControls();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('tnma_admin_session');
    showAdminLogin();
}

function closeAdminPanel() {
    document.getElementById('admin-panel').style.display = 'none';
}

function setBillboardState(state) {
    localStorage.setItem('tnma_billboard_state', state);
    checkBillboardState();
    updateAdminStatusText();
    alert(`Billboard section is now set to: ${state === 'live' ? 'LIVE MODE (Visible to Everyone)' : 'COMING SOON'}`);
}

function updateAdminStatusText() {
    const currentState = localStorage.getItem('tnma_billboard_state') || 'coming-soon';
    const statusText = document.getElementById('current-status');
    if (statusText) {
        statusText.textContent = `Current Status: ${currentState === 'live' ? '🟢 Live Mode' : '🟡 Coming Soon'}`;
    }
}

function checkBillboardState() {
    const state = localStorage.getItem('tnma_billboard_state') || 'coming-soon';
    const liveSection = document.getElementById('billboard-live-section');
    const comingSoonSection = document.getElementById('billboard-coming-soon');
    const adminNotice = document.getElementById('admin-view-notice');
    const isAdminSession = sessionStorage.getItem('tnma_admin_session') === 'true';

    if (state === 'live') {
        if (liveSection) liveSection.style.display = 'block';
        if (comingSoonSection) comingSoonSection.style.display = 'none';

        // Show admin notice only if user is logged in as admin
        if (adminNotice) {
            if (isAdminSession) {
                adminNotice.style.display = 'block';
            } else {
                adminNotice.style.display = 'none';
            }
        }
    } else {
        if (liveSection) liveSection.style.display = 'none';
        if (comingSoonSection) comingSoonSection.style.display = 'block';
    }
}


async function sendToDiscordWithTimeout(app, webhookUrl, timeout) {
    return Promise.race([
        sendToDiscord(app, webhookUrl),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Upload timeout')), timeout)
        )
    ]).catch(error => {
        console.error('❌ Error or timeout:', error);
        return false;
    });
}

async function sendToDiscord(app, webhookUrl) {
    console.log(`Sending ${app.type} application to Discord...`);
    console.log(`Using Webhook URL: ${webhookUrl}`);
    const currentYear = new Date().getFullYear();

    const embed = {
        title: `🔔 New ${app.type} Application`,
        description: `A new request for **${app.type} Advertising** has been received.`,
        color: app.type === 'Billboard' ? 3447003 : 65535, // Blue for Billboard, Yellow for Newspaper
        fields: [
            { name: "Application ID", value: app.id, inline: true },
            { name: "Ad Type", value: app.adType || "Business", inline: true },
            { name: "In-Game Name", value: app.inGameName, inline: true },
            { name: "In-Game Phone", value: app.inGamePhone, inline: true },
            { name: "Discord Name", value: app.discordName, inline: true },
            { name: app.adType === 'Community' ? "Community Name" : "Business Name", value: app.selectedName, inline: true },
            { name: "Type / Size", value: app.adSize, inline: true },
            { name: "Duration", value: app.duration, inline: true },
            { name: "Ad Content", value: app.content.length > 500 ? app.content.substring(0, 500) + '...' : app.content, inline: false }
        ],
        footer: {
            text: `© ${currentYear} TNMA | Powered By TG Solutions |Submitted on ${app.date} at ${app.time}`,
            icon_url: "https://i.imgur.com/YOUR_TNMA_LOGO.png" // Replace if you have a real URL
        },
        timestamp: new Date().toISOString()
    };

    if (app.notes && app.notes.trim()) {
        embed.fields.push({
            name: "📌 Additional Notes/Location",
            value: app.notes.length > 500 ? app.notes.substring(0, 500) + '...' : app.notes,
            inline: false
        });
    }

    // Add image to embed if uploaded
    if (app.imageFile) {
        embed.image = {
            url: "attachment://ad_design.png"
        };
    }

    try {
        const formData = new FormData();

        const payload = {
            content: "<@&1455460565173407825>",
            username: "TNMA Advertisement",
            embeds: [embed]
        };

        formData.append('payload_json', JSON.stringify(payload));

        // Add file if exists
        if (app.imageFile) {
            formData.append('file', app.imageFile, 'ad_design.png');
        }

        const response = await fetch(webhookUrl, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            console.log('✅ Discord notification sent successfully!');
            return true;
        } else {
            console.error('❌ Discord webhook failed:', response.status);
            const errorText = await response.text();
            console.error('Error details:', errorText);
            return false;
        }
    } catch (error) {
        console.error('❌ Error sending to Discord:', error);
        return false;
    }
}

function showMessage(type, text) {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;

    const container = document.querySelector('.container');
    container.insertBefore(message, container.firstChild);

    setTimeout(() => message.remove(), 5000);
}

// Support Popup Functions
function showSupportPopup() {
    const popup = document.getElementById('supportPopup');
    popup.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeSupportPopup(e) {
    if (e.target === e.currentTarget || e.target.classList.contains('close-modal')) {
        const popup = document.getElementById('supportPopup');
        popup.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
}

function copyDiscordUsername() {
    const username = document.getElementById('discordUsername').textContent;
    navigator.clipboard.writeText(username).then(() => {
        const tooltip = document.getElementById('copyTooltip');
        const originalText = tooltip.textContent;

        tooltip.textContent = "Copied!";
        tooltip.classList.add('show');

        setTimeout(() => {
            tooltip.classList.remove('show');
            setTimeout(() => {
                tooltip.textContent = originalText;
            }, 300);
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}
