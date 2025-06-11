document.addEventListener('DOMContentLoaded', () => {
    // *Initialize Elements*
    // Select form, steps, progress bar, and buttons for navigation and theme toggle
    const form = document.getElementById('multi-step-form');
    const steps = document.querySelectorAll('.form-step');
    const progress = document.getElementById('progress');
    const stepIndicators = document.querySelectorAll('.step');
    const nextButtons = document.querySelectorAll('.next-btn');
    const prevButtons = document.querySelectorAll('.prev-btn');
    const toggleTheme = document.getElementById('toggle-theme');
    const successMessage = document.getElementById('success-message');
    const restartBtn = document.getElementById('restart-btn');
    let currentStep = 1;

    // *Load Saved Form Data*
    // Retrieve and populate form data from localStorage
    loadFormData();

    // *Update Progress Bar*
    // Adjust the progress bar width and step indicators based on the current step
    function updateProgress() {
        const percent = ((currentStep - 1) / (steps.length - 1)) * 100;
        progress.style.width = `${percent}%`;
        stepIndicators.forEach((step, index) => {
            step.classList.toggle('active', index < currentStep);
        });
    }

    // *Show Current Step*
    // Display the active form step and update progress
    function showStep(step) {
        steps.forEach(s => s.classList.remove('active'));
        document.querySelector(`.form-step[data-step="${step}"]`).classList.add('active');
        currentStep = step;
        updateProgress();
    }

    // *Validate Form Steps*
    // Check input validity for each step before allowing navigation
    function validateStep(step) {
        if (step === 1) {
            // Validate Personal Information
            const fullName = document.getElementById('full-name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const nameRegex = /^[A-Za-z\s]{2,}$/;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^\d{10}$/;

            document.getElementById('full-name-error').textContent = nameRegex.test(fullName) ? '' : 'Enter a valid name';
            document.getElementById('email-error').textContent = emailRegex.test(email) ? '' : 'Enter a valid email';
            document.getElementById('phone-error').textContent = phoneRegex.test(phone) ? '' : 'Enter a 10-digit phone number';

            return nameRegex.test(fullName) && emailRegex.test(email) && phoneRegex.test(phone);
        } else if (step === 2) {
            // Validate Account Setup
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const usernameRegex = /^[A-Za-z0-9]{4,}$/;
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&])[A-Za-z\d!@#$%^&*]{8,}$/;

            document.getElementById('username-error').textContent = usernameRegex.test(username) ? '' : 'Username must be at least 4 characters';
            document.getElementById('password-error').textContent = passwordRegex.test(password) ? '' : 'Password must be at least 8 characters and include letters, numbers, and special characters';
            document.getElementById('confirm-password-error').textContent = password === confirmPassword ? '' : 'Passwords do not match';

            return usernameRegex.test(username) && passwordRegex.test(password) && password === confirmPassword;
        } else if (step === 3) {
            // Validate Profile Details
            const profilePic = document.getElementById('profile-pic').files[0];
            const bio = document.getElementById('bio').value;
            const skills = document.querySelectorAll('.skill-tag');

            document.getElementById('profile-pic-error').textContent = !profilePic || profilePic.size <= 2 * 1024 * 1024 ? '' : 'Image must be less than 2MB';
            document.getElementById('bio-error').textContent = bio.length <= 250 ? '' : 'Bio must be 250 characters or less';
            document.getElementById('skills-error').textContent = skills.length > 0 ? '' : 'Select at least one skill';

            return (!profilePic || profilePic.size <= 2 * 1024 * 1024) && bio.length <= 250 && skills.length > 0;
        }
        return true;
    }

    // *Save Form Data*
    // Store form data in localStorage for persistence
    function saveFormData() {
        const formData = {
            fullName: document.getElementById('full-name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            bio: document.getElementById('bio').value,
            skills: Array.from(document.querySelectorAll('.skill-tag')).map(tag => tag.textContent),
            profilePic: document.getElementById('preview').src
        };
        localStorage.setItem('formData', JSON.stringify(formData));
    }

    // *Load Form Data*
    // Populate form fields with saved data from localStorage
    function loadFormData() {
        const savedData = JSON.parse(localStorage.getItem('formData'));
        if (savedData) {
            document.getElementById('full-name').value = savedData.fullName || '';
            document.getElementById('email').value = savedData.email || '';
            document.getElementById('phone').value = savedData.phone || '';
            document.getElementById('username').value = savedData.username || '';
            document.getElementById('password').value = savedData.password || '';
            document.getElementById('bio').value = savedData.bio || '';
            if (savedData.skills) {
                savedData.skills.forEach(skill => addSkill(skill));
            }
            if (savedData.profilePic) {
                document.getElementById('preview').src = savedData.profilePic;
                document.getElementById('preview').style.display = 'block';
            }
        }
    }

    // *Password Strength Meter*
    // Evaluate password strength based on length, uppercase, numbers, and special characters
    document.getElementById('password').addEventListener('input', () => {
        const password = document.getElementById('password').value;
        const strengthBar = document.getElementById('strength-bar');
        const strengthText = document.getElementById('strength-text');
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[!@#$%^&*]/.test(password)) strength++;

        strengthBar.className = '';
        if (strength <= 1) {
            strengthBar.classList.add('weak');
            strengthText.textContent = 'Weak';
        } else if (strength <= 3) {
            strengthBar.classList.add('medium');
            strengthText.textContent = 'Medium';
        } else {
            strengthBar.classList.add('strong');
            strengthText.textContent = 'Strong';
        }
    });

    // *Image Preview*
    // Display a preview of the selected profile picture
    document.getElementById('profile-pic').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('preview').src = e.target.result;
                document.getElementById('preview').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // *Skills Tagging System*
    // Add and remove skills with a tagging interface
    const skillsInput = document.getElementById('skills');
    const skillsContainer = document.getElementById('skills-container');
    const availableSkills = ['JavaScript', 'Python', 'Java', 'HTML', 'CSS', 'React', 'Node.js'];

    skillsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && skillsInput.value.trim()) {
            e.preventDefault();
            addSkill(skillsInput.value.trim());
            skillsInput.value = '';
            saveFormData();
        }
    });

    // *Skills Autocomplete*
    // Suggest skills based on user input
    skillsInput.addEventListener('input', () => {
        const value = skillsInput.value.toLowerCase();
        const suggestions = availableSkills.filter(skill => skill.toLowerCase().includes(value));
        // For simplicity, skills are added on Enter
    });

    function addSkill(skill) {
        const tag = document.createElement('span');
        tag.classList.add('skill-tag');
        tag.textContent = skill;
        tag.addEventListener('click', () => {
            tag.remove();
            saveFormData();
        });
        skillsContainer.appendChild(tag);
    }

    // *Navigation: Next Buttons*
    // Handle next button clicks with validation and animation
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.add('animate-btn');
            setTimeout(() => button.classList.remove('animate-btn'), 200);
            const nextStep = parseInt(button.dataset.next);
            if (validateStep(currentStep)) {
                showStep(nextStep);
                saveFormData();
                if (nextStep === 4) {
                    displayReview();
                }
            }
        });
    });

    // *Navigation: Previous Buttons*
    // Handle previous button clicks with animation
    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.add('animate-btn');
            setTimeout(() => button.classList.remove('animate-btn'), 200);
            const prevStep = parseInt(button.dataset.prev);
            showStep(prevStep);
        });
    });

    // *Display Review Data*
    // Show all entered data in the review step
    function displayReview() {
        const review = document.getElementById('review-data');
        const formData = JSON.parse(localStorage.getItem('formData')) || {};
        review.innerHTML = `
            <h3>Personal Information</h3>
            <p><strong>Name:</strong> ${formData.fullName || ''}</p>
            <p><strong>Email:</strong> ${formData.email || ''}</p>
            <p><strong>Phone:</strong> ${formData.phone || ''}</p>
            <h3>Account Setup</h3>
            <p><strong>Username:</strong> ${formData.username || ''}</p>
            <h3>Profile Details</h3>
            <p><strong>Bio:</strong> ${formData.bio || ''}</p>
            <p><strong>Skills:</strong> ${formData.skills ? formData.skills.join(', ') : ''}</p>
            <p><strong>Profile Picture:</strong> <img src="${formData.profilePic || ''}" style="max-width: 120px; border-radius: 8px;"></p>
        `;
    }

    // *Form Submission*
    // Handle form submission with validation and success message
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.classList.add('animate-btn');
        setTimeout(() => submitBtn.classList.remove('animate-btn'), 200);
        if (currentStep === 4) {
            successMessage.style.display = 'flex';
            form.style.display = 'none';
            localStorage.removeItem('formData');
        }
    });

    // *Restart Form*
    // Reset the form and return to the first step
    restartBtn.addEventListener('click', () => {
        successMessage.style.display = 'none';
        form.style.display = 'block';
        showStep(1);
        document.getElementById('multi-step-form').reset();
        document.getElementById('preview').style.display = 'none';
        document.getElementById('skills-container').innerHTML = '';
        localStorage.removeItem('formData');
    });

    // *Bio Character Count*
    // Update character count for the bio field
    document.getElementById('bio').addEventListener('input', () => {
        const bio = document.getElementById('bio').value;
        document.getElementById('bio-char-count').textContent = `${bio.length}/250`;
        saveFormData();
    });

    // *Keyboard Accessibility*
    // Enable tab key navigation through form elements
    form.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const inputs = Array.from(form.querySelectorAll('input, textarea, button'));
            const currentIndex = inputs.indexOf(document.activeElement);
            const nextIndex = (currentIndex + 1) % inputs.length;
            inputs[nextIndex].focus();
        }
    });

    // *Dark Mode Toggle*
    // Toggle between light and dark mode with symbol change
    toggleTheme.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        toggleTheme.textContent = document.body.classList.contains('dark-mode') ? '☀' : '🌙';
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });

    // *Load Theme*
    // Apply saved theme on page load
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        toggleTheme.textContent = '☀';
    }

    // *Initialize Form*
    // Show the first step on page load
    showStep(1);
});
