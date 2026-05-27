/* INTERNREADY V2 JAVASCRIPT
   This file adds logic and interaction to the website.
   It controls readiness score, skills tracker, internship cards,
   saved internships, application modal, and interview accordion.
*/


let internships = [];

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

/* List of all important skills for the skill tracker */
const allSkills = [
    "HTML", "CSS", "JavaScript", "GitHub",
    "Excel", "SQL", "Python", "Data Visualization",
    "Networking", "Linux", "Security Basics", "Risk Awareness",
    "Figma", "Wireframing", "Typography", "UX Research",
    "Communication", "Teamwork"
];

/* 
   Array of internship objects.
   Each object stores information about one internship:
   company, title, category, location, deadline, description,
   requirements, and what the company offers.
*/


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
            /* Number() converts checkbox value from text to number */
            score += Number(checkbox.value);
        }
    });

    /* Limit score to 100 in case values become larger */
    if (score > 100) {
        score = 100;
    }

    /* Update score text in readiness section and hero panel */
    document.getElementById("readiness-score").textContent = score;
    document.getElementById("hero-score").textContent = score;

    /* Dynamically changes progress bar width */
    document.getElementById("readiness-progress").style.width = score + "%";
    document.getElementById("hero-progress").style.width = score + "%";

    /* Update message depending on score */
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

    /* Update hero skill number */
    document.getElementById("hero-skill-count").textContent =
        selectedSkills.length;

    /* 
       Skills are grouped by career category.
       This helps organize selected and missing skills separately.
    */
    const careerGroups = {
        web: ["HTML", "CSS", "JavaScript", "GitHub"],

        data: ["Excel", "SQL", "Python", "Data Visualization"],

        cyber: ["Networking", "Linux", "Security Basics", "Risk Awareness"],

        design: ["Figma", "Wireframing", "Typography", "UX Research"],

        soft: ["Communication", "Teamwork"]
    };

    /* Update selected and missing skills for each category */
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

    /* Remove active style from all summary buttons */
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

    /* Empty state */
    if (items.length === 0) {
        container.innerHTML =
            '<span class="empty-text">Nothing to show.</span>';
        return;
    }

    /* Create HTML tag element for every skill */
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

        /* 
           Template literal creates internship card dynamically.
           JavaScript inserts internship data directly into HTML.
        */
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

    const filterButtons = document.querySelectorAll(".filter-btn");

    /* Remove active style from all filter buttons */
    filterButtons.forEach(function (button) {
        button.classList.remove("active-filter");

        /* Add active style to selected category button */
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
        return saved.company === internship.company &&
               saved.title === internship.title;
    });

    if (alreadySaved) {
        alert("This internship is already saved.");
        return;
    }

    /* Add selected internship to saved list */
    savedInternships.push(internship);

    renderSavedInternships();
}

/* This function displays saved internships */
function renderSavedInternships() {
    const savedList = document.getElementById("saved-list");

    /* Clear previous saved list */
    savedList.innerHTML = "";

    /* Update hero saved count */
    document.getElementById("hero-saved-count").textContent =
        savedInternships.length;

    /* Show empty message if nothing is saved */
    if (savedInternships.length === 0) {
        savedList.innerHTML =
            '<span class="empty-text">No internships saved yet.</span>';
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


/* =====================================
   APPLICATION MODAL LOGIC
   ===================================== */

/* Opens application form modal */
function openApplyModal(index) {
    selectedInternshipIndex = index;

    const internship = internships[index];

    /* Show selected internship title inside popup */
    document.getElementById("modal-job-title").textContent =
        internship.title + " at " + internship.company;

    /* Clear old form data */
    document.getElementById("applicant-name").value = "";
    document.getElementById("applicant-email").value = "";
    document.getElementById("applicant-message").value = "";
    document.getElementById("application-success").textContent = "";

    /* Display popup modal window */
    document.getElementById("apply-modal").style.display = "flex";
}

/* Closes application form modal */
function closeApplyModal() {
    document.getElementById("apply-modal").style.display = "none";
}

/* Submits application form */
function submitApplication() {
    const name = document.getElementById("applicant-name").value.trim();
    const email = document.getElementById("applicant-email").value.trim();
    const message = document.getElementById("applicant-message").value.trim();

    /* Simple validation */
    if (name === "" || email === "" || message === "") {
        alert("Please fill in all fields.");
        return;
    }

    /* Save applied internship index to prevent duplicate applications */
    appliedInternships.push(selectedInternshipIndex);

    document.getElementById("application-success").textContent =
        "Application submitted successfully!";

    /* Re-render internship cards so Apply button becomes Applied */
    renderInternships("All");

    /* Close popup after short delay */
    setTimeout(function () {
        closeApplyModal();
    }, 1000);
}

/* This helper function creates company initials for the logo circle */
function getInitials(companyName) {
    /* Convert company name into initials for logo circle */
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

    /* Toggle show class to open or close answer */
    tips[index].classList.toggle("show");
}


/* =====================================
   INITIAL PAGE SETUP
   Runs when page first loads
   ===================================== */

/* Initialize readiness score */
updateReadinessScore();

/* Initialize skills summary */
updateSkills();


/* Initialize saved internship list */
renderSavedInternships();

loadInternships();