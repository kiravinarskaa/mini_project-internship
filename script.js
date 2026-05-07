/* =====================================
   INTERNREADY V2 JAVASCRIPT
   This file adds logic and interaction to the website
   ===================================== */
let selectedInternshipIndex = null;
let appliedInternships = [];
/* List of all important skills for the skill tracker */
const allSkills = [
    "HTML",
    "CSS",
    "JavaScript",
    "GitHub",
    "SQL",
    "Python",
    "Communication",
    "Teamwork"
];

/* Internship data.
   In a real project, this data could come from a database.
   For this front-end prototype, we store opportunities in an array.
*/
const internships = [
    {
        company: "BrightWeb Studio",
        title: "Front-End Developer Intern",
        category: "Web",
        location: "Remote",
        deadline: "June 10",

        description:
            "Assist in building responsive web pages and interactive UI components.",

        requirements:
            "Basic HTML, CSS, JavaScript, and GitHub knowledge.",

        offers:
            "Mentorship, portfolio experience, flexible schedule."
    },

    {
        company: "CyberShield Lab",
        title: "SOC Assistant Intern",
        category: "Cybersecurity",
        location: "Hybrid",
        deadline: "June 18",

        description:
            "Assist in monitoring alerts and preparing awareness materials for internal users.",

        requirements:
            "Basic networking knowledge and cybersecurity interest.",

        offers:
            "SIEM exposure, mentorship, beginner SOC experience."
    }
];

/* This array stores saved internships */
let savedInternships = [];

/* =====================================
   READINESS CHECKER LOGIC
   ===================================== */

/* Get all readiness checklist checkboxes */
const readinessChecks = document.querySelectorAll(".readiness-check");

/* Add event listener to each readiness checkbox */
readinessChecks.forEach(function (checkbox) {
    checkbox.addEventListener("change", updateReadinessScore);
});

/* This function calculates and updates the readiness score */
function updateReadinessScore() {
    let score = 0;

    /* Add value of each checked item */
    readinessChecks.forEach(function (checkbox) {
        if (checkbox.checked) {
            score += Number(checkbox.value);
        }
    });

    /* Limit score to 100 in case values become larger */
    if (score > 100) {
        score = 100;
    }

    /* Update score text */
    document.getElementById("readiness-score").textContent = score;
    document.getElementById("hero-score").textContent = score;

    /* Update progress bars */
    document.getElementById("readiness-progress").style.width = score + "%";
    document.getElementById("hero-progress").style.width = score + "%";

    /* Update message depending on score */
    const message = document.getElementById("readiness-message");

    if (score < 40) {
        message.textContent = "You are at the beginning stage. Focus on CV, basic skills, and one project.";
    } else if (score < 75) {
        message.textContent = "Good progress. Improve missing areas and start browsing suitable internships.";
    } else {
        message.textContent = "Great! You look close to internship-ready. Keep practicing interviews and applying.";
    }
}

/* =====================================
   SKILLS TRACKER LOGIC
   ===================================== */

/* Get all skill checkboxes */
const skillChecks = document.querySelectorAll(".skill-check");

/* Add event listener to each skill checkbox */
skillChecks.forEach(function (checkbox) {
    checkbox.addEventListener("change", updateSkills);
});

/* This function updates selected and missing skills */
function updateSkills() {
    let selectedSkills = [];

    /* Collect selected skills */
    skillChecks.forEach(function (checkbox) {
        if (checkbox.checked) {
            selectedSkills.push(checkbox.value);
        }
    });

    /* Find skills that are not selected */
    const missingSkills = allSkills.filter(function (skill) {
        return !selectedSkills.includes(skill);
    });

    /* Update hero skill number */
    document.getElementById("hero-skill-count").textContent = selectedSkills.length;

    /* Show selected skills */
    showTags("selected-skills", selectedSkills, false);

    /* Show missing skills */
    showTags("missing-skills", missingSkills, true);
}

/* This helper function displays skill tags */
function showTags(containerId, items, isMissing) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    /* If no items exist, show empty message */
    if (items.length === 0) {
        container.innerHTML = '<span class="empty-text">Nothing to show.</span>';
        return;
    }

    /* Create a tag for each item */
    items.forEach(function (item) {
        const tag = document.createElement("span");
        tag.className = isMissing ? "tag missing" : "tag";
        tag.textContent = item;
        container.appendChild(tag);
    });
}

/* =====================================
   INTERNSHIP OPPORTUNITIES LOGIC
   ===================================== */

/* This function displays internship cards */
function renderInternships(category) {
    const internshipList = document.getElementById("internship-list");

    /* Clear old cards before adding new ones */
    internshipList.innerHTML = "";

    /* Filter internships by selected category */
    let filteredInternships = internships;

    if (category !== "All") {
        filteredInternships = internships.filter(function (internship) {
            return internship.category === category;
        });
    }

    /* Create one card for each internship */
    filteredInternships.forEach(function (internship) {
        const originalIndex = internships.indexOf(internship);

        const card = document.createElement("div");
        card.className = "internship-card";

        /* The card content is inserted with template literal */
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
                <p><strong>Deadline:</strong> ${internship.deadline}</p>
            </div>

            <div class="card-actions">
                <button class="save-btn" onclick="saveInternship(${originalIndex})">Save</button>

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
    /* Render filtered cards */
    renderInternships(category);

    /* Update active filter button */
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

    /* Avoid saving the same internship twice */
    const alreadySaved = savedInternships.some(function (saved) {
        return saved.company === internship.company && saved.title === internship.title;
    });

    if (alreadySaved) {
        alert("This internship is already saved.");
        return;
    }

    savedInternships.push(internship);
    renderSavedInternships();
}

/* This function displays saved internships */
function renderSavedInternships() {
    const savedList = document.getElementById("saved-list");

    /* Clear previous saved list */
    savedList.innerHTML = "";

    /* Update hero saved count */
    document.getElementById("hero-saved-count").textContent = savedInternships.length;

    /* Show empty message if nothing is saved */
    if (savedInternships.length === 0) {
        savedList.innerHTML = '<span class="empty-text">No internships saved yet.</span>';
        return;
    }

    /* Create a small saved item for each saved internship */
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

/* This function removes a saved internship */
function removeSavedInternship(index) {
    savedInternships.splice(index, 1);
    renderSavedInternships();
}


openApplyModal(originalIndex)
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

/* =====================================
   INTERVIEW PREP LOGIC
   ===================================== */

/* This function opens or closes interview tips */
function toggleTip(index) {
    const tips = document.querySelectorAll(".tip-text");
    tips[index].classList.toggle("show");
}

/* =====================================
   INITIAL PAGE SETUP
   Runs when page first loads
   ===================================== */
updateReadinessScore();
updateSkills();
renderInternships("All");
renderSavedInternships();
