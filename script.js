/* INTERNREADY V2 JAVASCRIPT
   This file adds logic and interaction to the website.
   It controls readiness score, skills tracker, internship cards,
   saved internships, application modal, and interview accordion.
*/


/* Stores internships loaded from MySQL database through Vercel API */
let internships = [];

/* Loads internship data from backend API */
async function loadInternships() {
    try {
        const response = await fetch("/api/internships");

        internships = await response.json();

        renderInternships("All");

    } catch (error) {
        console.log("Error loading internships:", error);
    }
}


/* Stores currently selected internship for application popup */
let selectedInternshipIndex = null;

/* Stores internships where the user already clicked Apply */
let appliedInternships = [];

/* This array stores saved internships */
let savedInternships = [];


/* List of all important skills for the skill tracker */
const allSkills = [
    "HTML", "CSS", "JavaScript", "GitHub",
    "Excel", "SQL", "Python", "Data Visualization",
    "Networking", "Linux", "Security Basics", "Risk Awareness",
    "Figma", "Wireframing", "Typography", "UX Research",
    "Communication", "Teamwork"
];


/* READINESS CHECKER LOGIC */

const readinessChecks = document.querySelectorAll(".readiness-check");

readinessChecks.forEach(function (checkbox) {
    checkbox.addEventListener("change", updateReadinessScore);
});

/* This function calculates and updates the readiness score */
function updateReadinessScore() {
    let score = 0;

    readinessChecks.forEach(function (checkbox) {
        if (checkbox.checked) {
            score += Number(checkbox.value);
        }
    });

    if (score > 100) {
        score = 100;
    }

    document.getElementById("readiness-score").textContent = score;
    document.getElementById("hero-score").textContent = score;

    document.getElementById("readiness-progress").style.width = score + "%";
    document.getElementById("hero-progress").style.width = score + "%";

    const message = document.getElementById("readiness-message");

    if (score < 40) {
        message.textContent =
            "You are at the beginning stage. Focus on CV, basic skills, and one project.";
    } else if (score < 75) {
        message.textContent =
            "Good progress. Improve missing areas and start browsing suitable internships.";
    } else {
        message.textContent =
            "Great! You look close to internship-ready. Keep practicing interviews and applying.";
    }
}


/* SKILLS TRACKER LOGIC */

const skillChecks = document.querySelectorAll(".skill-check");

skillChecks.forEach(function (checkbox) {
    checkbox.addEventListener("change", updateSkills);
});

/* This function updates selected and missing skills */
function updateSkills() {
    let selectedSkills = [];

    skillChecks.forEach(function (checkbox) {
        if (checkbox.checked) {
            selectedSkills.push(checkbox.value);
        }
    });

    document.getElementById("hero-skill-count").textContent =
        selectedSkills.length;

    const careerGroups = {
        web: ["HTML", "CSS", "JavaScript", "GitHub"],
        data: ["Excel", "SQL", "Python", "Data Visualization"],
        cyber: ["Networking", "Linux", "Security Basics", "Risk Awareness"],
        design: ["Figma", "Wireframing", "Typography", "UX Research"],
        soft: ["Communication", "Teamwork"]
    };

    for (const group in careerGroups) {
        const selected = careerGroups[group].filter(function (skill) {
            return selectedSkills.includes(skill);
        });

        const missing = careerGroups[group].filter(function (skill) {
            return !selectedSkills.includes(skill);
        });

        showTags(group + "-selected", selected, false);
        showTags(group + "-missing", missing, true);
    }
}

/* Toggle between selected and missing skill summaries */
function showSkillSummary(type) {
    const selectedSummary = document.getElementById("selected-summary");
    const missingSummary = document.getElementById("missing-summary");
    const buttons = document.querySelectorAll(".summary-btn");

    buttons.forEach(function (button) {
        button.classList.remove("active-summary");
    });

    if (type === "selected") {
        selectedSummary.classList.remove("hidden-summary");
        missingSummary.classList.add("hidden-summary");
        buttons[0].classList.add("active-summary");
    } else {
        missingSummary.classList.remove("hidden-summary");
        selectedSummary.classList.add("hidden-summary");
        buttons[1].classList.add("active-summary");
    }
}

/* This helper function displays skill tags */
function showTags(containerId, items, isMissing) {
    const container = document.getElementById(containerId);

    container.innerHTML = "";

    if (items.length === 0) {
        container.innerHTML =
            '<span class="empty-text">Nothing to show.</span>';
        return;
    }

    items.forEach(function (item) {
        const tag = document.createElement("span");

        tag.className = isMissing ? "tag missing" : "tag";
        tag.textContent = item;

        container.appendChild(tag);
    });
}


/* INTERNSHIP OPPORTUNITIES LOGIC */

/* This function displays internship cards */
function renderInternships(category) {
    const internshipList = document.getElementById("internship-list");

    internshipList.innerHTML = "";

    let filteredInternships = internships;

    if (category !== "All") {
        filteredInternships = internships.filter(function (internship) {
            return internship.category === category;
        });
    }

    filteredInternships.forEach(function (internship) {
        const originalIndex = internships.indexOf(internship);

        /* Check whether this internship is already saved */
        const isSaved = savedInternships.some(function (saved) {
            return saved.company === internship.company &&
                   saved.title === internship.title;
        });

        const card = document.createElement("div");
        card.className = "internship-card";

        card.innerHTML = `
            <div class="internship-top">
                <div class="company-logo">${getInitials(internship.company)}</div>
                <span class="category-pill">${internship.category}</span>
            </div>

            <h3>${internship.title}</h3>
            <p class="company-name">${internship.company}</p>

            <div class="internship-details">
                <p><strong>Description:</strong> ${internship.description}</p>
                <p><strong>Requirements:</strong> ${internship.requirements}</p>
                <p><strong>What company offers:</strong> ${internship.offers}</p>
                <p><strong>Location:</strong> ${internship.location}</p>
                <p><strong>Deadline:</strong> ${new Date(internship.deadline).toLocaleDateString("en-GB")}</p>
            </div>

            <div class="card-actions">
                ${
                    isSaved
                    ? `<button class="saved-btn" onclick="removeSavedInternshipByCard(${originalIndex})">Saved</button>`
                    : `<button class="save-btn" onclick="saveInternship(${originalIndex})">Save</button>`
                }

                ${
                    appliedInternships.includes(originalIndex)
                    ? `<button class="applied-btn" disabled>Applied</button>`
                    : `<button class="apply-btn" onclick="openApplyModal(${originalIndex})">Apply</button>`
                }
            </div>
        `;

        internshipList.appendChild(card);
    });
}

/* This function filters internships when user clicks category */
function filterInternships(category) {
    renderInternships(category);

    const filterButtons = document.querySelectorAll(".filter-btn");

    filterButtons.forEach(function (button) {
        button.classList.remove("active-filter");

        if (button.dataset.category === category) {
            button.classList.add("active-filter");
        }
    });
}

/* This function saves an internship */
function saveInternship(index) {
    const internship = internships[index];

    const alreadySaved = savedInternships.some(function (saved) {
        return saved.company === internship.company &&
               saved.title === internship.title;
    });

    if (alreadySaved) {
        return;
    }

    savedInternships.push(internship);

    renderSavedInternships();
    renderInternships("All");
}

/* This function displays saved internships */
function renderSavedInternships() {
    const savedList = document.getElementById("saved-list");

    savedList.innerHTML = "";

    document.getElementById("hero-saved-count").textContent =
        savedInternships.length;

    if (savedInternships.length === 0) {
        savedList.innerHTML =
            '<span class="empty-text">No internships saved yet.</span>';
        return;
    }

    savedInternships.forEach(function (internship, index) {
        const item = document.createElement("div");
        item.className = "saved-item";

        item.innerHTML = `
            ${internship.title} at ${internship.company}
            <button class="remove-saved" onclick="removeSavedInternship(${index})">×</button>
        `;

        savedList.appendChild(item);
    });
}

/* This function removes internship from saved list */
function removeSavedInternship(index) {
    savedInternships.splice(index, 1);

    renderSavedInternships();
    renderInternships("All");
}

/* This function removes saved internship by clicking the Saved button on the card */
function removeSavedInternshipByCard(index) {
    const internship = internships[index];

    savedInternships = savedInternships.filter(function (saved) {
        return !(
            saved.company === internship.company &&
            saved.title === internship.title
        );
    });

    renderSavedInternships();
    renderInternships("All");
}


/* APPLICATION MODAL LOGIC */

/* Opens application form modal */
function openApplyModal(index) {
    selectedInternshipIndex = index;

    const internship = internships[index];

    document.getElementById("modal-job-title").textContent =
        internship.title + " at " + internship.company;

    document.getElementById("applicant-name").value = "";
    document.getElementById("applicant-email").value = "";
    document.getElementById("applicant-message").value = "";
    document.getElementById("cv").value = "";

    document.getElementById("name-error").textContent = "";
    document.getElementById("email-error").textContent = "";
    document.getElementById("cv-error").textContent = "";
    document.getElementById("message-error").textContent = "";
    document.getElementById("application-success").textContent = "";

    document.getElementById("apply-modal").style.display = "flex";
}

/* Closes application form modal */
function closeApplyModal() {
    document.getElementById("apply-modal").style.display = "none";
}

/* Submits application form with inline validation */
function submitApplication() {
    const name = document.getElementById("applicant-name").value.trim();
    const email = document.getElementById("applicant-email").value.trim();
    const message = document.getElementById("applicant-message").value.trim();
    const cv = document.getElementById("cv").files[0];

    document.getElementById("name-error").textContent = "";
    document.getElementById("email-error").textContent = "";
    document.getElementById("cv-error").textContent = "";
    document.getElementById("message-error").textContent = "";

    let isValid = true;

    if (name === "") {
        document.getElementById("name-error").textContent =
            "Full name is required.";
        isValid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email === "") {
        document.getElementById("email-error").textContent =
            "Email is required.";
        isValid = false;
    } else if (!emailPattern.test(email)) {
        document.getElementById("email-error").textContent =
            "Enter a valid email address.";
        isValid = false;
    }

    if (!cv) {
        document.getElementById("cv-error").textContent =
            "Please upload your CV.";
        isValid = false;
    } else {
        const allowedFileTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];

        if (!allowedFileTypes.includes(cv.type)) {
            document.getElementById("cv-error").textContent =
                "Only PDF or Word files are allowed.";
            isValid = false;
        }
    }

    if (message === "") {
        document.getElementById("message-error").textContent =
            "Short motivation is required.";
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    appliedInternships.push(selectedInternshipIndex);

    document.getElementById("application-success").textContent =
        "Application submitted successfully!";

    renderInternships("All");

    setTimeout(function () {
        closeApplyModal();
    }, 1000);
}


/* This helper function creates company initials for the logo circle */
function getInitials(companyName) {
    return companyName
        .split(" ")
        .map(function (word) {
            return word[0];
        })
        .join("")
        .substring(0, 2)
        .toUpperCase();
}


/* INTERVIEW PREP LOGIC */

/* This function opens or closes interview tips */
function toggleTip(index) {
    const tips = document.querySelectorAll(".tip-text");

    tips[index].classList.toggle("show");
}


/* Runs when page first loads */

updateReadinessScore();

updateSkills();

renderSavedInternships();

loadInternships();