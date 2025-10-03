import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import Lenis from "lenis";

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create("hop", ".87,0,.13,1");

  // Check if we're on the diensten page
  const isDienstenPage = window.location.pathname.includes('diensten.html');

  // ========== PAGE FADE IN EFFECT ==========
  // Add fade in effect when page loads
  gsap.set('body', { opacity: 0 });
  gsap.to('body', {
    opacity: 1,
    duration: 0.6,
    ease: "power2.out"
  });

  // ========== ORIGINAL TELESCOPE SCROLL ANIMATION ==========
  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Only run telescope animation on main page, not on diensten page
  if (!isDienstenPage) {
  const bannerContainer = document.querySelector(".banner-img-container");
  const bannerIntroTextElements = gsap.utils.toArray(".banner-intro-text");
  const bannerMaskLayers = gsap.utils.toArray(".mask");
  
  // Track if "Wij zijn NieuwNet" has been shown
  let hasShownIntroText = false;
  
  // Track if "Wij bouwen" has been shown
  let hasShownWijBouwen = false;

  // Debug: Check elements
  console.log("🔍 Found elements:");
  console.log("- Banner container:", !!bannerContainer);
  console.log("- Intro text elements:", bannerIntroTextElements.length);
  console.log("- Mask layers:", bannerMaskLayers.length);
  
  if (!bannerContainer) {
    console.error("❌ Banner container not found!");
    return;
  }

  const bannerHeaderItems = document.querySelectorAll(".services-list h1");
  let allWordsSplits = [];
  
  bannerHeaderItems.forEach((item) => {
    const split = new SplitText(item, { type: "words" });
    allWordsSplits.push(...split.words);
  });
  
  gsap.set(allWordsSplits, { opacity: 0 });

  bannerMaskLayers.forEach((layer, i) => {
    gsap.set(layer, { scale: 0.9 - i * 0.2 });
  });
  gsap.set(bannerContainer, { scale: 0 });

  ScrollTrigger.create({
    trigger: ".banner",
    start: "top top",
    end: `+=${window.innerHeight * 4}px`,
    pin: false, // Disable pin to avoid conflict
    pinSpacing: false,
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress;

      gsap.set(bannerContainer, { scale: progress });

      bannerMaskLayers.forEach((layer, i) => {
        const initialScale = 0.9 - i * 0.2;
        const layerProgress = Math.min(progress / 0.9, 1.0);
        const currentScale =
          initialScale + layerProgress * (1.0 - initialScale);

        gsap.set(layer, { scale: currentScale });
      });

      if (progress <= 0.9) {
        const textProgress = progress / 0.9;
        const moveDistance = window.innerWidth * 0.8; // Increased from 0.5 to 0.8 for more movement
        
        // Much faster movement on mobile devices
        const isMobile = window.innerWidth <= 600;
        const mobileSpeedup = isMobile ? 2.5 : 1.3; // Faster on both mobile and desktop
        const adjustedTextProgress = Math.min(textProgress * mobileSpeedup, 1);

        gsap.set(bannerIntroTextElements[0], {
          x: -adjustedTextProgress * moveDistance,
        });
        gsap.set(bannerIntroTextElements[1], {
          x: adjustedTextProgress * moveDistance,
        });
        
        // Mark that intro text has been shown
        if (adjustedTextProgress >= 0.8) {
          hasShownIntroText = true;
        }
      }
      
      // If intro text has been shown, keep it in final position
      if (hasShownIntroText) {
        const moveDistance = window.innerWidth * 0.8;
        gsap.set(bannerIntroTextElements[0], {
          x: -moveDistance,
        });
        gsap.set(bannerIntroTextElements[1], {
          x: moveDistance,
        });
      }

      if ((progress >= 0.2 && progress <= 0.9) || (window.innerWidth <= 600 && progress >= 0.05)) {
        const headerProgress = (progress - 0.2) / 0.7;
        const totalWords = allWordsSplits.length;
        
        // Much earlier appearance on mobile devices
        const isMobile = window.innerWidth <= 600;
        let adjustedHeaderProgress;
        
        if (isMobile) {
          // On mobile, start much much earlier and be further in the animation
          const mobileHeaderProgress = Math.max(0, (progress - 0.02) / 0.95);
          // Start the animation at 50% progress instead of 0% for mobile
          adjustedHeaderProgress = Math.min((mobileHeaderProgress + 0.5) * 3, 1);
        } else {
          adjustedHeaderProgress = headerProgress;
        }

        allWordsSplits.forEach((word, i) => {
          const wordStartDelay = i / totalWords;
          const wordEndDelay = (i + 1) / totalWords;

          let wordOpacity = 0;

          if (adjustedHeaderProgress >= wordEndDelay) {
            wordOpacity = 1;
          } else if (adjustedHeaderProgress >= wordStartDelay) {
            const wordProgress =
              (adjustedHeaderProgress - wordStartDelay) /
              (wordEndDelay - wordStartDelay);
            wordOpacity = wordProgress;
          }

          gsap.set(word, { opacity: wordOpacity });
        });
        
        // Mark that "Wij bouwen" has been shown
        if (adjustedHeaderProgress >= 0.5) {
          hasShownWijBouwen = true;
        }
      } else if (progress < 0.7) {
        // Only hide if "Wij bouwen" hasn't been shown yet
        if (!hasShownWijBouwen) {
        gsap.set(allWordsSplits, { opacity: 0 });
        }
      } else if (progress > 0.9) {
        gsap.set(allWordsSplits, { opacity: 1 });
        hasShownWijBouwen = true;
      }
      
      // If "Wij bouwen" has been shown, keep it visible
      if (hasShownWijBouwen) {
        gsap.set(allWordsSplits, { opacity: 1 });
      }
    },
  });
  } // End of telescope animation (only on main page)

  // ========== HAMBURGER MENU SYSTEM ==========
  const textContainers = document.querySelectorAll(".menu-col");
  let splitTextByContainer = [];

  textContainers.forEach((container) => {
    const textElements = container.querySelectorAll("a, p");
    let containerSplits = [];

    textElements.forEach((element) => {
      const split = SplitText.create(element, {
        type: "lines",
        mask: "lines",
        linesClass: "line",
      });
      containerSplits.push(split);
      gsap.set(split.lines, { y: "-110%" });
    });

    splitTextByContainer.push(containerSplits);
  });

  const mainContent = document.querySelector(".main-content");
  const outroContent = document.querySelector(".outro-content");
  const bannerSection = document.querySelector(".banner");
  const menuToggleBtn = document.querySelector(".menu-toggle-btn");
  const menuOverlay = document.querySelector(".menu-overlay");
  const menuOverlayContainer = document.querySelector(".menu-overlay-content");
  const menuMediaWrapper = document.querySelector(".menu-media-wrapper");
  const copyContainers = document.querySelectorAll(".menu-col");
  const menuToggleLabel = document.querySelector(".menu-toggle-label p");
  const hamburgerIcon = document.querySelector(".menu-hamburger-icon");

  // Debug: Check menu elements
  console.log("🍔 Menu elements check:");
  console.log("- Menu toggle button:", !!menuToggleBtn);
  console.log("- Menu overlay:", !!menuOverlay);
  console.log("- Hamburger icon:", !!hamburgerIcon);
  
  if (!menuToggleBtn) {
    console.error("❌ Menu toggle button not found!");
    return;
  }

  let isMenuOpen = false;
  let isAnimating = false;
  let isOverOnsPanelOpen = false; // State for Over Ons panel
  let isOverOnsPanelAnimating = false; // Animation state for Over Ons panel

  menuToggleBtn.addEventListener("click", () => {
    console.log("🖱️ Menu button clicked, isAnimating:", isAnimating, "isMenuOpen:", isMenuOpen);
    
    if (isAnimating) return;

    // If Over Ons panel is open, close it first before opening menu
    if (isOverOnsPanelOpen && !isMenuOpen) {
      console.log("📋 Over Ons panel is open, closing it first");
      closeOverOnsPanel();
      
      // Wait for Over Ons panel to close, then open menu
      setTimeout(() => {
        if (!isOverOnsPanelAnimating) {
          isAnimating = true;
          console.log(`🔝 Opening menu after Over Ons panel closed`);
          setTimeout(() => {
            openMenuAfterScroll();
          }, 100);
        }
      }, 1200); // Wait for panel close animation (1s) + buffer
      return;
    }

    if (!isMenuOpen) {
      isAnimating = true;
      
      console.log(`🔝 Opening menu`);
      
      // Open menu with proper timing
      setTimeout(() => {
          openMenuAfterScroll();
      }, 100);
      
    } else {
      // Close menu logic
      closeMenu();
    }
  });
  
  function openMenuAfterScroll() {
    // Disable scrolling completely when main menu opens
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // Stop Lenis smooth scrolling
    lenis.stop();
    
    // Force menu to be blue when opening (override any scroll-based color changes)
    const menuToggleLabelText = document.querySelector('.menu-toggle-label p');
    const menuHamburgerSpans = document.querySelectorAll('.menu-hamburger-icon span');
    const menuHamburgerIconElement = document.querySelector('.menu-hamburger-icon');
    
    if (menuToggleLabelText && menuHamburgerSpans.length > 0 && menuHamburgerIconElement) {
      gsap.set(menuToggleLabelText, { color: '#04295B' });
      gsap.set(menuHamburgerSpans, { backgroundColor: '#04295B' });
      gsap.set(menuHamburgerIconElement, { borderColor: 'rgba(4, 41, 91, 0.2)' });
    }
    
    // Create timeline for menu animations
    const tl = gsap.timeline();

    tl.to(menuToggleLabel, {
      y: "-110%",
      duration: 0.8,
      ease: "power2.out",
    })
    .to(bannerSection, {
      y: "100vh",
      duration: 0.8,
      ease: "power2.out",
    }, "<")
    .to(outroContent, {
      y: "100vh",
      duration: 0.8,
      ease: "power2.out",
    }, "<")
    .to(menuOverlay, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 0.8,
      ease: "power2.out",
    }, "<")
    .to(menuOverlayContainer, {
      yPercent: 0,
      duration: 0.8,
      ease: "power2.out",
    }, "<")
    .to(menuMediaWrapper, {
      opacity: 1,
      duration: 0.6,
      ease: "power2.out",
      delay: 0.5,
    }, "<");

    // Animate text lines
    splitTextByContainer.forEach((containerSplits) => {
      const copyLines = containerSplits.flatMap((split) => split.lines);
      tl.to(copyLines, {
        y: "0%",
        duration: 2,
        ease: "hop",
        stagger: -0.075,
      }, -0.15);
    });

    hamburgerIcon.classList.add("active");

    tl.call(() => {
      isAnimating = false;
    });

    isMenuOpen = true;
  }

  function closeMenu() {
    isAnimating = true;
    hamburgerIcon.classList.remove("active");

    // Create timeline for menu close animations
    const tl = gsap.timeline();

    tl.to(bannerSection, {
      y: "0vh",
      duration: 0.8,
      ease: "power2.out",
    })
    .to(outroContent, {
      y: "0vh",
      duration: 0.8,
      ease: "power2.out",
    }, "<")
    .to(menuOverlay, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      duration: 0.8,
      ease: "power2.out",
    }, "<")
    .to(menuOverlayContainer, {
      yPercent: -50,
      duration: 0.8,
      ease: "power2.out",
    }, "<")
    .to(menuToggleLabel, {
      y: "0%",
      duration: 0.8,
      ease: "power2.out",
    }, "<")
    .to(copyContainers, {
      opacity: 0.25,
      duration: 1,
      ease: "hop",
    }, "<")
;

    tl.call(() => {
      // Re-enable scrolling completely when main menu closes
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      
      // Restart Lenis smooth scrolling
      lenis.start();
      
      // Reset text animations
      splitTextByContainer.forEach((containerSplits) => {
        const copyLines = containerSplits.flatMap((split) => split.lines);
        gsap.set(copyLines, { y: "-110%" });
      });

      gsap.set(copyContainers, { opacity: 1 });
      gsap.set(menuMediaWrapper, { opacity: 0 });

      // Restore menu color based on current scroll position
      const menuToggleLabelText = document.querySelector('.menu-toggle-label p');
      const menuHamburgerSpans = document.querySelectorAll('.menu-hamburger-icon span');
      const menuHamburgerIconElement = document.querySelector('.menu-hamburger-icon');
      
      if (menuToggleLabelText && menuHamburgerSpans.length > 0 && menuHamburgerIconElement) {
        // Check if we're in the banner background section
        const bannerBackgroundSection = document.getElementById('banner-background-section');
        if (bannerBackgroundSection) {
          const sectionRect = bannerBackgroundSection.getBoundingClientRect();
          const isInDarkSection = sectionRect.top <= 80 && sectionRect.bottom >= 80;
          
          if (isInDarkSection) {
            // We're in the dark section, keep menu white
            gsap.set(menuToggleLabelText, { color: '#FFFFFF' });
            gsap.set(menuHamburgerSpans, { backgroundColor: '#FFFFFF' });
            gsap.set(menuHamburgerIconElement, { borderColor: 'rgba(255, 255, 255, 0.3)' });
          } else {
            // We're not in the dark section, use blue
            gsap.set(menuToggleLabelText, { color: '#04295B' });
            gsap.set(menuHamburgerSpans, { backgroundColor: '#04295B' });
            gsap.set(menuHamburgerIconElement, { borderColor: 'rgba(4, 41, 91, 0.2)' });
          }
        }
      }

      isAnimating = false;
    });

    isMenuOpen = false;
  }



  // ========== CONTACT MENU SYSTEM ==========
  const contactTextContainers = document.querySelectorAll(".contact-menu-col");
  let contactSplitTextByContainer = [];

  contactTextContainers.forEach((container) => {
    const textElements = container.querySelectorAll("a, p");
    let containerSplits = [];

    textElements.forEach((element) => {
      const split = SplitText.create(element, {
        type: "lines",
        mask: "lines",
        linesClass: "line",
      });
      containerSplits.push(split);
      gsap.set(split.lines, { y: "110%" });
    });

    contactSplitTextByContainer.push(containerSplits);
  });

  const contactMenuOverlay = document.querySelector(".contact-menu-overlay");
  const contactMenuOverlayContainer = document.querySelector(".contact-menu-overlay-content");
  const contactMenuMediaWrapper = document.querySelector(".contact-menu-media-wrapper");
  const contactCopyContainers = document.querySelectorAll(".contact-menu-col");
  const contactMenuCloseBtn = document.getElementById("contactMenuCloseBtn");

  // Debug: Check contact menu elements
  console.log("📞 Contact menu elements check:");
  console.log("- Contact menu overlay:", !!contactMenuOverlay);
  console.log("- Contact menu close button:", !!contactMenuCloseBtn);

  let isContactMenuOpen = false;
  let isContactMenuAnimating = false;

  // Add click functionality to the beautiful CTA button
  const contactCtaBtn = document.getElementById("contactCtaBtn");
  if (contactCtaBtn) {
    contactCtaBtn.addEventListener("click", () => {
      console.log("🖱️ Contact CTA button clicked");
      
      if (isContactMenuAnimating) return;

      if (!isContactMenuOpen) {
        isContactMenuAnimating = true;
        
        console.log(`📞 Opening contact menu from CTA button`);
        
        // Open contact menu with proper timing
        setTimeout(() => {
          openContactMenuAfterScroll();
        }, 100);
      }
    });
  }

  // Contact Form Buttons Event Listeners
  const offerteBtn = document.getElementById('offerteBtn');
  const gesprekBtn = document.getElementById('gesprekBtn');
  const contactFormSection = document.getElementById('contactFormSection');
  const cancelFormBtn = document.getElementById('cancelForm');
  const contactForm = document.getElementById('contactForm');
  const subjectSelect = document.getElementById('subject');

  if (offerteBtn) {
    offerteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log("📋 Offerte button clicked");
      showContactForm('offerte');
    });
  }

  if (gesprekBtn) {
    gesprekBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log("📅 Gesprek button clicked");
      showContactForm('gesprek');
    });
  }

  // Add event listener for "Andere vraag" button
  const andereVraagBtn = document.getElementById('andereVraagBtn');
  if (andereVraagBtn) {
    andereVraagBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log("❓ Andere vraag button clicked");
      showContactForm('andere vraag');
    });
  }

  if (cancelFormBtn) {
    cancelFormBtn.addEventListener('click', () => {
      console.log("❌ Cancel form clicked");
      hideContactForm();
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log("📤 Form submitted");
      
      // Clear previous errors
      clearFormErrors();
      
      // Check if form is valid
      const isValid = contactForm.checkValidity();
      console.log("Form valid:", isValid);
      
      if (isValid) {
        console.log("✅ Form is valid, submitting...");
        handleFormSubmit();
      } else {
        console.log("❌ Form is invalid, showing errors...");
        // Show custom error styling
        showFormErrors();
      }
    });
  }

  function clearFormErrors() {
    const allFields = contactForm.querySelectorAll('input, textarea');
    allFields.forEach(field => {
      field.classList.remove('error');
      const errorMessage = field.nextElementSibling;
      if (errorMessage && errorMessage.classList.contains('error-message')) {
        errorMessage.style.display = 'none';
      }
    });
  }

  function showFormErrors() {
    const requiredFields = contactForm.querySelectorAll('input[required], textarea[required]');
    
    requiredFields.forEach(field => {
      let hasError = false;
      
      // Check if field is empty
      if (!field.value.trim()) {
        hasError = true;
      }
      
      // Check email validation
      if (field.type === 'email' && field.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value.trim())) {
          hasError = true;
        }
      }
      
      if (hasError) {
        field.classList.add('error');
        const errorMessage = field.nextElementSibling;
        if (errorMessage && errorMessage.classList.contains('error-message')) {
          if (field.type === 'email' && field.value.trim() && !field.value.trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            errorMessage.textContent = 'Voer een geldig e-mailadres in';
          } else {
            errorMessage.textContent = 'Dit veld is verplicht';
          }
          errorMessage.style.display = 'block';
        }
      } else {
        field.classList.remove('error');
        const errorMessage = field.nextElementSibling;
        if (errorMessage && errorMessage.classList.contains('error-message')) {
          errorMessage.style.display = 'none';
        }
      }
    });
  }

  // Clear errors on input (no real-time validation)
  const formInputs = contactForm.querySelectorAll('input, textarea');
  formInputs.forEach(input => {
    input.addEventListener('input', () => {
      // Only clear errors, don't validate in real-time
      input.classList.remove('error');
      const errorMessage = input.nextElementSibling;
      if (errorMessage && errorMessage.classList.contains('error-message')) {
        errorMessage.style.display = 'none';
      }
    });
  });

  function showContactForm(type) {
    if (contactFormSection && subjectSelect) {
      // Set the subject based on button clicked
      if (type === 'offerte') {
        subjectSelect.value = 'Offerte aanvraag';
      } else if (type === 'gesprek') {
        subjectSelect.value = 'Gesprek inplannen';
      }
      
      // Show the form
      contactFormSection.classList.add('show');
      
      // Add scroll lock when form is shown
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      lenis.stop();
    }
  }

  function hideContactForm() {
    if (contactFormSection) {
      contactFormSection.classList.remove('show');
      
      // Remove scroll lock when form is hidden
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      lenis.start();
      
      // Reset form
      if (contactForm) {
        contactForm.reset();
      }
    }
  }

  function handleFormSubmit() {
    console.log("🚀 handleFormSubmit called");
    
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    console.log("Form data:", data);
    
    // Get the form title element - try multiple selectors
    let formTitle = contactForm.querySelector('h2');
    if (!formTitle) {
      // Try finding it in the parent container
      formTitle = contactForm.parentElement.querySelector('h2');
    }
    if (!formTitle) {
      // Try finding it by text content
      const allH2s = document.querySelectorAll('h2');
      formTitle = Array.from(allH2s).find(h2 => h2.textContent.includes('Vertel ons wat je wil'));
    }
    
    console.log("Form title element found:", formTitle);
    
    const userName = data.name || 'je';
    console.log("User name:", userName);
    
    // Change the title to thank you message
    if (formTitle) {
      console.log("Updating title...");
      formTitle.innerHTML = `Bedankt voor je<br>bericht, ${userName}!<br><br><span style="font-weight: normal; font-size: 0.5em; line-height: 1.4; padding-left: 2rem; padding-right: 2rem; display: block;">We nemen zo snel mogelijk contact met je op.</span>`;
      // Make title slightly larger than original with responsive sizing
      const isMobile = window.innerWidth <= 600;
      const isTablet = window.innerWidth <= 1000 && window.innerWidth > 600;
      
      formTitle.style.paddingLeft = '';
      formTitle.style.paddingRight = '';
      formTitle.style.textAlign = '';
      formTitle.style.lineHeight = '';
      
      if (isMobile) {
        formTitle.style.fontSize = '2.6rem'; // 20% larger than original 2.2rem
      } else if (isTablet) {
        formTitle.style.fontSize = '3.4rem'; // 20% larger than original 2.8rem
      } else {
        formTitle.style.fontSize = '4.2rem'; // 20% larger than original 3.5rem
      }
      console.log("Title updated to:", formTitle.textContent);
    } else {
      console.log("❌ Form title element not found! Trying alternative approach...");
      // Alternative: create a new title element
      const newTitle = document.createElement('h2');
      newTitle.innerHTML = `Bedankt voor je<br>bericht, ${userName}!<br><br><span style="font-weight: normal; font-size: 0.5em; line-height: 1.4; padding-left: 2rem; padding-right: 2rem; display: block;">We nemen zo snel mogelijk contact met je op.</span>`;
      // Make title slightly larger than original with responsive sizing
      const isMobile = window.innerWidth <= 600;
      const isTablet = window.innerWidth <= 1000 && window.innerWidth > 600;
      
      if (isMobile) {
        newTitle.style.fontSize = '2.6rem'; // 20% larger than original 2.2rem
      } else if (isTablet) {
        newTitle.style.fontSize = '3.4rem'; // 20% larger than original 2.8rem
      } else {
        newTitle.style.fontSize = '4.2rem'; // 20% larger than original 3.5rem
      }
      
      // Insert at the top of the form
      contactForm.insertBefore(newTitle, contactForm.firstChild);
      console.log("Created new title element");
    }
    
    // Hide the form fields
    const formFields = contactForm.querySelectorAll('.form-group, button[type="submit"]');
    formFields.forEach(field => {
      field.style.display = 'none';
    });
    
    // No close button needed - user can close via menu or other means
    
    // TODO: Implement actual form submission logic here
  }
  
  function resetContactForm() {
    // Reset the form title
    const formTitle = contactForm.querySelector('h2');
    if (formTitle) {
      formTitle.textContent = 'Vertel ons wat je wil!';
      formTitle.style.color = '';
      formTitle.style.fontSize = '';
      formTitle.style.textAlign = '';
      formTitle.style.lineHeight = '';
    }
    
    // Show form fields again
    const formFields = contactForm.querySelectorAll('.form-group, button[type="submit"]');
    formFields.forEach(field => {
      field.style.display = '';
    });
    
    // No close buttons to remove anymore
    
    // Reset form values
    contactForm.reset();
    
    // Remove any error classes
    const errorFields = contactForm.querySelectorAll('.error');
    errorFields.forEach(field => {
      field.classList.remove('error');
    });
  }

  // Add click functionality to the contact menu close button
  if (contactMenuCloseBtn) {
    contactMenuCloseBtn.addEventListener("click", () => {
      console.log("❌ Contact menu close button clicked");
      
      if (isContactMenuAnimating) return;

      if (isContactMenuOpen) {
        closeContactMenu();
      }
    });
  }
  
  function openContactMenuAfterScroll() {
    // Disable scrolling on body when menu opens
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // Stop Lenis smooth scrolling
    lenis.stop();
    
    // Create timeline for contact menu animations
    const tl = gsap.timeline();

    tl.to(mainContent, {
      y: "-200vh",
      duration: 1,
      ease: "hop",
    })
    .to(outroContent, {
      y: "-200vh",
      duration: 1,
      ease: "hop",
    }, "<")
    .to(contactMenuOverlay, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 1,
      ease: "hop",
    }, "<")
    .to(contactMenuOverlayContainer, {
      yPercent: 0,
      duration: 1,
      ease: "hop",
    }, "<")
    .to(contactMenuMediaWrapper, {
      opacity: 1,
      duration: 0.75,
      ease: "power2.out",
      delay: 0.5,
    }, "<");

    // Show close button after overlay is visible
    if (contactMenuCloseBtn) {
      tl.call(() => {
        contactMenuCloseBtn.classList.add("visible");
      }, null, 0.5);
    }

    // Animate text lines
    contactSplitTextByContainer.forEach((containerSplits) => {
      const copyLines = containerSplits.flatMap((split) => split.lines);
      tl.to(copyLines, {
        y: "0%",
        duration: 2,
        ease: "hop",
        stagger: -0.075,
      }, -0.15);
    });

    tl.call(() => {
      isContactMenuAnimating = false;
    });

    isContactMenuOpen = true;
  }

  function closeContactMenu() {
    isContactMenuAnimating = true;

    // Hide close button immediately
    if (contactMenuCloseBtn) {
      contactMenuCloseBtn.classList.remove("visible");
    }

    // Create timeline for contact menu close animations
    const tl = gsap.timeline();

    tl.to(mainContent, {
      y: "0vh",
      duration: 1,
      ease: "hop",
    })
    .to(outroContent, {
      y: "0vh",
      duration: 1,
      ease: "hop",
    }, "<")
    .to(contactMenuOverlay, {
      clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      duration: 1,
      ease: "hop",
    }, "<")
    .to(contactMenuOverlayContainer, {
      yPercent: 50,
      duration: 1,
      ease: "hop",
    }, "<")
    .to(contactCopyContainers, {
      opacity: 0.25,
      duration: 1,
      ease: "hop",
    }, "<");

    tl.call(() => {
      // Re-enable scrolling on body when menu closes
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      
      // Start Lenis smooth scrolling
      lenis.start();
      
      // Reset text animations
      contactSplitTextByContainer.forEach((containerSplits) => {
        const copyLines = containerSplits.flatMap((split) => split.lines);
        gsap.set(copyLines, { y: "110%" });
      });

      gsap.set(contactCopyContainers, { opacity: 1 });
      gsap.set(contactMenuMediaWrapper, { opacity: 0 });

      isContactMenuAnimating = false;
    });

    isContactMenuOpen = false;
  }

  // Add escape key functionality to close contact menu, exit diensten mode, or close over ons panel
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (isContactMenuOpen && !isContactMenuAnimating) {
        closeContactMenu();
      } else if (isOverOnsPanelOpen && !isOverOnsPanelAnimating) {
        closeOverOnsPanel();
      }
    }
  });

  // Add click outside functionality to close contact menu
  if (contactMenuOverlay) {
    contactMenuOverlay.addEventListener("click", (e) => {
      if (e.target === contactMenuOverlay && isContactMenuOpen && !isContactMenuAnimating) {
        closeContactMenu();
      }
    });
  }

  // Add wheel listener to detect scroll up when any menu is open or prevent scroll in diensten mode or Over Ons panel
  window.addEventListener("wheel", (e) => {
    // If Over Ons panel is open, prevent ALL scrolling in both directions
    if (isOverOnsPanelOpen) {
      e.preventDefault();
      return;
    }
    
    // If main menu is open, prevent ALL scrolling in both directions
    if (isMenuOpen && !isAnimating) {
      e.preventDefault();
      return;
    }
    
    // Scroll up behavior removed - contact menu stays open
  }, { passive: false }); // Changed to passive: false to allow preventDefault

  // Add touch listener to prevent scrolling on mobile when menu is open
  window.addEventListener("touchmove", (e) => {
    // If main menu is open, prevent ALL scrolling
    if (isMenuOpen && !isAnimating) {
      e.preventDefault();
      return;
    }
    
    // If Over Ons panel is open, prevent ALL scrolling
    if (isOverOnsPanelOpen) {
      e.preventDefault();
      return;
    }
    
    // If contact menu is open, prevent ALL scrolling
    if (isContactMenuOpen) {
      e.preventDefault();
      return;
    }
  }, { passive: false });

  // ========== HOME NAVIGATION FUNCTIONALITY ==========
  const homeLink = document.getElementById("homeLink");
  
  if (homeLink) {
    homeLink.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("🏠 Home link clicked");
      
      // Check if we're on diensten page
      if (window.location.pathname.includes('diensten.html')) {
        // Close menu first, then navigate with fade
        if (isMenuOpen) {
          closeMenu();
          setTimeout(() => {
            fadeOutAndNavigate('/index.html');
          }, 800); // Wait for menu close animation
        } else {
          // Navigate immediately with fade
          fadeOutAndNavigate('/index.html');
        }
        return;
      }
      
      // If menu is open, scroll first then close menu
      if (isMenuOpen) {
        // Start scrolling immediately
        scrollToHomeWithAnimation();
        
        // Close menu after a short delay to allow scroll to start
        setTimeout(() => {
          closeMenu();
        }, 200);
      } else {
        // If menu is already closed, just scroll to home
        scrollToHomeWithAnimation();
      }
    });
  }
  
  function scrollToHomeWithAnimation() {
    console.log("🏠 Scrolling to home with animation");
    
    // Create a smooth scroll animation to the top
    const tl = gsap.timeline();
    
    // Smooth scroll to top using Lenis
    lenis.scrollTo(0, {
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing for smooth deceleration
      force: true,
      onComplete: () => {
        // Reset animating state when scroll is complete
        isAnimating = false;
      }
    });
    
    // Optional: Add a subtle scale animation to the banner for visual feedback
    const bannerContainer = document.querySelector(".banner-img-container");
    if (bannerContainer) {
      tl.to(bannerContainer, {
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      })
      .to(bannerContainer, {
        scale: 1,
        duration: 0.7,
        ease: "power2.out"
      });
    }
  }

  // ========== DIENSTEN NAVIGATION FUNCTIONALITY ==========
  const dienstenLink = document.getElementById("dienstenLink");
  
  if (dienstenLink) {
    dienstenLink.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("🔧 Diensten link clicked");
      
      // Check if we're on the diensten page or main page
      const isDienstenPage = window.location.pathname.includes('diensten.html');
      
      if (isDienstenPage) {
        // If we're on the diensten page, just close the menu
      if (isMenuOpen) {
          closeMenu();
        }
      } else {
        // If we're on the main page, navigate to diensten page
        if (isMenuOpen) {
          // Close menu first, then navigate with fade
          closeMenu();
          setTimeout(() => {
            fadeOutAndNavigate('/diensten.html');
          }, 1000); // Wait for menu close animation
        } else {
          // Navigate immediately with fade
          fadeOutAndNavigate('/diensten.html');
        }
      }
    });
  }

  // Add event listener for "Onze diensten" button in Over Ons section
  const overOnsDienstenBtn = document.querySelector('.over-ons-btn-primary');
  if (overOnsDienstenBtn) {
    overOnsDienstenBtn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("🔧 Over Ons diensten button clicked");
      fadeOutAndNavigate('/diensten.html');
    });
  }

  // Add event listener for "Neem contact op" button in Over Ons section
  const overOnsContactBtn = document.querySelector('.over-ons-btn-secondary');
  if (overOnsContactBtn) {
    overOnsContactBtn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("📞 Over Ons contact button clicked");
      
      // Close the over ons panel first
      if (isOverOnsPanelOpen) {
        closeOverOnsPanel();
        
        // Wait for panel to close, then scroll to contact
        setTimeout(() => {
          const contactSection = document.getElementById('contact');
          if (contactSection) {
            contactSection.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 600); // Wait for panel close animation
      } else {
        // Panel is already closed, scroll directly
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  }

  // ========== OVER ONS NAVIGATION FUNCTIONALITY ==========
  const overOnsLink = document.getElementById("overOnsLink");
  
  if (overOnsLink) {
    overOnsLink.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("👥 Over Ons link clicked");
      
      // Check if we're on diensten page
      if (window.location.pathname.includes('diensten.html')) {
        // Close menu first, then navigate with fade
        if (isMenuOpen) {
          closeMenu();
          setTimeout(() => {
            fadeOutAndNavigate('/index.html#banner-background-section');
          }, 800); // Wait for menu close animation
        } else {
          // Navigate immediately with fade
          fadeOutAndNavigate('/index.html#banner-background-section');
        }
        return;
      }
      
      // If menu is open, scroll first then close menu
      if (isMenuOpen) {
        // Start scrolling immediately
        scrollToOverOnsWithAnimation();
        
        // Close menu after a short delay to allow scroll to start
        setTimeout(() => {
          closeMenu();
        }, 200);
      } else {
        // If menu is already closed, just scroll to over ons section
        scrollToOverOnsWithAnimation();
      }
    });
  }

  // ========== CONTACT NAVIGATION FUNCTIONALITY ==========
  const contactLink = document.getElementById("contactLink");
  
  if (contactLink) {
    contactLink.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("📞 Contact link clicked");
      
      // Check if we're on diensten page
      if (window.location.pathname.includes('diensten.html')) {
        // Close menu first, then navigate with fade
        if (isMenuOpen) {
          closeMenu();
          setTimeout(() => {
            fadeOutAndNavigate('/index.html#outro-section');
          }, 800); // Wait for menu close animation
        } else {
          // Navigate immediately with fade
          fadeOutAndNavigate('/index.html#outro-section');
        }
        return;
      }
      
      // If menu is open, scroll first then close menu
      if (isMenuOpen) {
        // Start scrolling immediately
        scrollToContactWithAnimation();
        
        // Close menu after a short delay to allow scroll to start
        setTimeout(() => {
          closeMenu();
        }, 200);
      } else {
        // If menu is already closed, just scroll to contact section
        scrollToContactWithAnimation();
      }
    });
  }
  
  function scrollToDienstenWithAnimation() {
    console.log("🔧 Scrolling to Diensten (100% telescope animation complete)");
    
    // Get the banner section
    const bannerSection = document.querySelector(".banner");
    
    if (bannerSection) {
      // Calculate scroll position where telescope animation is 100% complete
      // The ScrollTrigger ends at window.innerHeight * 4, so we scroll to exactly that point
      const bannerRect = bannerSection.getBoundingClientRect();
      const bannerTop = window.pageYOffset + bannerRect.top;
      const scrollPosition = bannerTop + (window.innerHeight * 4); // Exactly at 100% telescope animation
      
      // Adjust scroll position to show diensten section in top 100% of viewport
      const dienstenSection = document.querySelector(".diensten");
      if (dienstenSection) {
        const dienstenRect = dienstenSection.getBoundingClientRect();
        const dienstenTop = window.pageYOffset + dienstenRect.top;
        // Scroll to show diensten section at the very top of viewport
        const adjustedScrollPosition = dienstenTop;
        
        // Smooth scroll to that position using Lenis
        lenis.scrollTo(adjustedScrollPosition, {
          duration: 1.5,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing for smooth deceleration
          force: true,
          onComplete: () => {
            // Scroll completed
          }
        });
      } else {
        // Fallback to original scroll position if diensten section not found
        lenis.scrollTo(scrollPosition, {
          duration: 1.5,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          force: true,
          onComplete: () => {
            // Scroll completed
          }
        });
      }
      
      console.log(`📍 Scrolling to position: ${scrollPosition} (100% telescope animation)`);
    } else {
      console.error("❌ Banner section not found!");
    }
  }

  function scrollToOverOnsWithAnimation() {
    console.log("👥 Scrolling to Over Ons section");
    
    // Get the banner background section
    const overOnsSection = document.getElementById("banner-background-section");
    
    if (overOnsSection) {
      // Calculate scroll position to the section
      const sectionRect = overOnsSection.getBoundingClientRect();
      const sectionTop = window.pageYOffset + sectionRect.top;
      
      // Smooth scroll to that position using Lenis
      lenis.scrollTo(sectionTop, {
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing for smooth deceleration
        force: true,
        onComplete: () => {
          // Scroll completed
        }
      });
      
      console.log(`📍 Scrolling to Over Ons section at position: ${sectionTop}`);
    } else {
      console.error("❌ Over Ons section not found!");
    }
  }

  function scrollToContactWithAnimation() {
    console.log("📞 Scrolling to Contact section");
    
    // Get the outro section (contact section)
    const contactSection = document.getElementById("outro-section");
    
    if (contactSection) {
      // Calculate scroll position to the section
      const sectionRect = contactSection.getBoundingClientRect();
      const sectionTop = window.pageYOffset + sectionRect.top;
      
      // Adjust scroll position to show contact section perfectly at the top
      const adjustedScrollPosition = sectionTop - 20; // Small offset to ensure perfect positioning
      
      // Smooth scroll to that position using Lenis
      lenis.scrollTo(adjustedScrollPosition, {
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing for smooth deceleration
        force: true,
        onComplete: () => {
          // Scroll completed
        }
      });
      
      console.log(`📍 Scrolling to Contact section at position: ${adjustedScrollPosition}`);
    } else {
      console.error("❌ Contact section not found!");
    }
  }

  // ========== TIME-BASED TEXT ROTATION WITH SCROLL VISIBILITY ==========
  // Only run text rotation on main page, not on diensten page
  if (!isDienstenPage) {
  const rotatingTextElements = document.querySelectorAll('.rotating-text');
  
  if (rotatingTextElements.length > 0) {
    const allWords = ['Websites', 'Webshops', 'Apps', 'Platforms', 'Webtools'];
    let currentWordIndex = 0;
    let isAnimating = false;
    let rotationInterval;
    
    // Function to rotate to next word - only change the service word, keep "Wij bouwen" visible
    function rotateToNextWord() {
      if (isAnimating) return;
      
      isAnimating = true;
      const nextIndex = (currentWordIndex + 1) % allWords.length;
      
      // Animate only the service words (rotating-text spans), not the "Wij bouwen" text
      rotatingTextElements.forEach((element, elementIndex) => {
        const targetIndex = (elementIndex + nextIndex) % allWords.length;
        
        // Slide out current service word
        gsap.to(element, {
          y: -50,
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => {
            // Change service text
            element.textContent = allWords[targetIndex];
            gsap.set(element, { y: 50, opacity: 0 });
            
            // Slide in new service word
            gsap.to(element, {
              y: 0,
              opacity: 1,
              duration: 0.3,
              ease: "power2.out",
              onComplete: () => {
                if (elementIndex === rotatingTextElements.length - 1) {
                  isAnimating = false;
                }
              }
            });
          }
        });
      });
      
      currentWordIndex = nextIndex;
    }
    
    // Start automatic rotation every 3 seconds
    rotationInterval = setInterval(rotateToNextWord, 3000);
    
    // Create ScrollTrigger for visibility control and arrow button
    ScrollTrigger.create({
      trigger: ".banner",
      start: "top top",
      end: `+=${window.innerHeight * 5}px`, // Extended scroll area for full "Wij bouwen" visibility
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        
        // Show/hide arrow button only when "Wij bouwen" is in volledig formaat
        const arrowBtn = document.querySelector('.banner-arrow-btn');
        const favicon = document.querySelector('.banner-favicon');
        
        if (arrowBtn) {
          if (progress >= 0.85) {
            // Show arrow button only when "Wij bouwen" is in volledig formaat (85%+)
            gsap.to(arrowBtn, {
              opacity: 1,
              scale: 1,
              duration: 0.25,
              ease: "back.out(1.7)"
            });
          } else {
            // Hide arrow button when "Wij bouwen" is not in volledig formaat
            gsap.to(arrowBtn, {
              opacity: 0,
              scale: 0.8,
              duration: 0.05,
              ease: "power2.in"
            });
          }
        }
        
        if (favicon) {
          if (progress >= 0.85) {
            // Show favicon at the same time as arrow button
            gsap.to(favicon, {
              opacity: 1,
              scale: 1,
              duration: 0.25,
              ease: "back.out(1.7)"
            });
          } else {
            // Hide favicon when "Wij bouwen" is not in volledig formaat
            gsap.to(favicon, {
              opacity: 0,
              scale: 0.8,
              duration: 0.05,
              ease: "power2.in"
            });
          }
        }
        
        // Hide/show "Wij bouwen" text and services together - show earlier
        const servicesList = document.querySelector('.services-list');
        const bannerHeader = document.querySelector('.banner-header');
        
        if (servicesList && bannerHeader) {
          if (progress < 0.25) {
            // Hide both "Wij bouwen" text and services when near the beginning
            gsap.to([servicesList, bannerHeader], {
              opacity: 0,
              duration: 0.3,
              ease: "power2.out"
            });
            // Stop text rotation when hidden
            if (rotationInterval) {
              clearInterval(rotationInterval);
              rotationInterval = null;
            }
          } else {
            // Show both "Wij bouwen" text and services earlier when telescope starts expanding
            gsap.to([servicesList, bannerHeader], {
              opacity: 1,
              duration: 0.3,
              ease: "power2.out"
            });
            // Start text rotation when visible
            if (!rotationInterval) {
              rotationInterval = setInterval(rotateToNextWord, 3000);
            }
          }
        }
      }
    });
  }
  } // End of text rotation (only on main page)


  // ========== PAGE TRANSITION FUNCTIONS ==========
  function fadeOutAndNavigate(url) {
    // Create fade overlay
    const fadeOverlay = document.createElement('div');
    fadeOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: #F5F5F5;
      z-index: 9999;
      opacity: 0;
      pointer-events: none;
    `;
    document.body.appendChild(fadeOverlay);
    
    // Fade out animation
    gsap.to(fadeOverlay, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.inOut",
      onComplete: () => {
        // Navigate after fade out completes
        window.location.href = url;
      }
    });
  }

  // ========== BANNER ARROW BUTTON (STATIC PIL) ==========
  // Add click functionality to banner arrow button (only on main page)
  if (!isDienstenPage) {
    const bannerArrowBtn = document.querySelector('.banner-arrow-btn');
    
    if (bannerArrowBtn) {
      bannerArrowBtn.addEventListener('click', () => {
        console.log("🖱️ Banner arrow button clicked - navigating to diensten page");
        fadeOutAndNavigate('/diensten.html');
      });
    }
  }

  // ========== DIENSTEN BACK BUTTON ==========
  // Add click functionality to diensten back button (only on diensten page)
  if (isDienstenPage) {
    const dienstenBackBtn = document.querySelector('.diensten-back-btn');
    
    if (dienstenBackBtn) {
      dienstenBackBtn.addEventListener('click', () => {
        console.log("🔙 Diensten back button clicked - navigating to home page");
        fadeOutAndNavigate('/index.html#services');
      });
    }
  }

  // ========== DIENSTEN ITEM CLICK FUNCTIONALITY ==========
  // Add click functionality to dienst items (only on diensten page)
  if (isDienstenPage) {
    const dienstItems = document.querySelectorAll('.dienst-item');
    let currentActiveIndex = 0; // Start op eerste item (Websites)
    
    // Dienst beschrijvingen data
    const dienstBeschrijvingen = [
      {
        titel: "Websites",
        tekst: "Professionele websites die perfect aansluiten bij jouw bedrijf en doelgroep. Van eenvoudige bedrijfspagina's tot complexe webapplicaties.",
        logos: [
          { src: "public/Diensten Logos/Nextjs-logo.svg.png", alt: "Next.js" },
          { src: "public/Diensten Logos/react-js.png", alt: "React" },
          { src: "public/Diensten Logos/Node.js_logo_2015.svg.png", alt: "Node.js" },
          { src: "public/Diensten Logos/pngwing.com.png", alt: "Vercel", class: "vercel-logo" }
        ]
      },
      {
        titel: "Webshops",
        tekst: "Complete e-commerce oplossingen om jouw producten online te verkopen. Van productcatalogus tot betalingssysteem en voorraadbeheer.",
        logos: [
          { src: "public/Diensten Logos/Shopify_logo_2018.svg.png", alt: "Shopify" },
          { src: "public/Diensten Logos/Nextjs-logo.svg.png", alt: "Next.js" },
          { src: "public/Diensten Logos/react-js.png", alt: "React" },
          { src: "public/Diensten Logos/pngwing.com.png", alt: "Vercel", class: "vercel-logo" }
        ]
      },
      {
        titel: "Apps",
        tekst: "Mobiele en web applicaties die jouw bedrijf naar het volgende niveau tillen. Native iOS, Android en cross-platform oplossingen.",
        logos: [
          { src: "public/Diensten Logos/App_Store_(iOS)-Badge-Alternative-Logo.wine.svg", alt: "iOS App Store" },
          { src: "public/Diensten Logos/pngwing.com.png", alt: "Android" },
          { src: "public/Diensten Logos/react-js.png", alt: "React Native" }
        ]
      },
      {
        titel: "Webtools",
        tekst: "Praktische tools die jouw dagelijkse werkzaamheden vereenvoudigen. Van dashboards tot automatisering en integraties.",
        logos: [
          { src: "public/Diensten Logos/Nextjs-logo.svg.png", alt: "Next.js" },
          { src: "public/Diensten Logos/react-js.png", alt: "React" },
          { src: "public/Diensten Logos/Node.js_logo_2015.svg.png", alt: "Node.js" }
        ]
      },
      {
        titel: "Workflows",
        tekst: "Slimme workflows die jouw processen optimaliseren. Van workflow automatisering tot data-integratie en API-koppelingen.",
        logos: [
          { src: "public/Diensten Logos/N8n-logo-new.svg", alt: "N8N" },
          { src: "public/Diensten Logos/Firebase-Logo.png", alt: "Firebase" },
          { src: "public/Diensten Logos/Node.js_logo_2015.svg.png", alt: "Node.js" }
        ]
      }
    ];
    
    // Initialize "Wij bouwen" op middelste positie
    initializeWijBouwenPosition();
    
    dienstItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        console.log(`🖱️ Dienst item ${index + 1} clicked`);
        
        // Check if we're on mobile
        const isMobile = window.innerWidth <= 600;
        
        if (isMobile) {
          // Mobile: Toggle dienst beschrijving
          const dienstBeschrijving = document.querySelector('.dienst-beschrijving');
          const isCurrentlyActive = item.classList.contains('active');
          
          // Remove active class from all items
          dienstItems.forEach(otherItem => {
            otherItem.classList.remove('active');
          });
          
          if (!isCurrentlyActive) {
            // Add active class to clicked item
            item.classList.add('active');
            
            // Show dienst beschrijving
            dienstBeschrijving.classList.add('active');
            
            // Update dienst beschrijving content
            updateDienstBeschrijving(index);
          } else {
            // Hide dienst beschrijving
            dienstBeschrijving.classList.remove('active');
          }
        } else {
          // Desktop: Original behavior
          // If clicking the same item, do nothing
          if (currentActiveIndex === index) return;
          
          // Remove active class from all items
          dienstItems.forEach(otherItem => {
            otherItem.classList.remove('active');
          });
          
          // Add active class to clicked item
          item.classList.add('active');
          
          // Animate "Wij bouwen" vertical movement
          animateWijBouwenVerticalMovement(index, dienstItems);
          
          // Update dienst beschrijving
          updateDienstBeschrijving(index);
          
          currentActiveIndex = index;
        }
      });
    });
    
    function initializeWijBouwenPosition() {
      const isMobile = window.innerWidth <= 600;
      
      if (isMobile) {
        // Mobile: Set middle item as active (same as desktop)
        const middleItem = dienstItems[currentActiveIndex];
        if (middleItem) {
          middleItem.classList.add('active');
          // Initialize dienst beschrijving for middle item
          updateDienstBeschrijving(currentActiveIndex);
        }
      } else {
        // Desktop: Original behavior with floating element
        const floatingWijBouwen = document.querySelector('.floating-wij-bouwen');
        const middleItem = dienstItems[currentActiveIndex];
        
        if (floatingWijBouwen && middleItem) {
          const middleRect = middleItem.getBoundingClientRect();
          const containerRect = document.querySelector('.diensten-header').getBoundingClientRect();
          
          const relativeX = middleRect.left - containerRect.left;
          const relativeY = middleRect.top - containerRect.top;
          
          gsap.set(floatingWijBouwen, {
            x: relativeX,
            y: relativeY,
            opacity: 1
          });
          
          // Set middle item as active
          middleItem.classList.add('active');
          
          // Initialize dienst beschrijving
          updateDienstBeschrijving(currentActiveIndex);
          
          // Recalculate position on window resize
          window.addEventListener('resize', () => {
            if (window.innerWidth > 600 && floatingWijBouwen && middleItem) {
              const middleRect = middleItem.getBoundingClientRect();
              const containerRect = document.querySelector('.diensten-header').getBoundingClientRect();
              
              const relativeX = middleRect.left - containerRect.left;
              const relativeY = middleRect.top - containerRect.top;
              
              gsap.set(floatingWijBouwen, {
                x: relativeX,
                y: relativeY
              });
            }
          });
        }
      }
    }
    
    function updateDienstBeschrijving(index) {
      const titelElement = document.querySelector('.dienst-beschrijving-titel');
      const tekstElement = document.querySelector('.dienst-beschrijving-tekst');
      const logosContainer = document.querySelector('.dienst-logos');
      
      if (titelElement && tekstElement && dienstBeschrijvingen[index]) {
        // Smooth fade out
        gsap.to([titelElement, tekstElement, logosContainer], {
          opacity: 0,
          duration: 0.2,
          ease: "power2.inOut",
          onComplete: () => {
            // Update content
            titelElement.textContent = dienstBeschrijvingen[index].titel;
            tekstElement.textContent = dienstBeschrijvingen[index].tekst;
            
            // Update logos
            if (logosContainer && dienstBeschrijvingen[index].logos) {
              logosContainer.innerHTML = '';
              dienstBeschrijvingen[index].logos.forEach(logo => {
                const img = document.createElement('img');
                img.src = logo.src;
                img.alt = logo.alt;
                img.className = logo.class ? `dienst-logo ${logo.class}` : 'dienst-logo';
                logosContainer.appendChild(img);
              });
            }
            
            // Smooth fade in
            gsap.to([titelElement, tekstElement, logosContainer], {
              opacity: 1,
              duration: 0.3,
              ease: "power2.out"
            });
          }
        });
      }
    }
    
    function animateWijBouwenVerticalMovement(targetIndex, items) {
      // Get the floating "Wij bouwen" element
      const floatingWijBouwen = document.querySelector('.floating-wij-bouwen');
      
      if (!floatingWijBouwen) return;
      
      // Check if we're on mobile
      const isMobile = window.innerWidth <= 600;
      
      if (isMobile) {
        // Mobile: Move "Wij bouwen" to the clicked item position
        const targetItem = items[targetIndex];
        const targetRect = targetItem.getBoundingClientRect();
        const containerRect = document.querySelector('.diensten-header').getBoundingClientRect();
        
        const relativeX = targetRect.left - containerRect.left;
        const relativeY = targetRect.top - containerRect.top;
        
        // Smooth movement to target position
        gsap.to(floatingWijBouwen, {
          x: relativeX,
          y: relativeY,
          duration: 0.4,
          ease: "power2.out"
        });
      } else {
        // Desktop: Only vertical movement (keep X the same)
        const targetItem = items[targetIndex];
        const targetRect = targetItem.getBoundingClientRect();
        const containerRect = document.querySelector('.diensten-header').getBoundingClientRect();
        
        const currentX = gsap.getProperty(floatingWijBouwen, "x");
        const relativeY = targetRect.top - containerRect.top;
        
        // Smooth vertical movement only
        gsap.to(floatingWijBouwen, {
          y: relativeY,
          duration: 0.4,
          ease: "power2.out"
        });
      }
    }
  }



  // ========== CONTACT CTA BUTTON HOVER ANIMATION ==========
  // Using CSS hover effects instead of JavaScript for better performance

  // ========== BANNER BACKGROUND CTA BUTTON ==========
  const bannerBgCtaBtnElement = document.querySelector('.banner-bg-cta-button');
  const bannerBgBtnText = document.getElementById('bannerBgBtnText');

  // ========== OVER ONS PANEL SYSTEM ==========
  const overOnsPanel = document.querySelector('.over-ons-panel');
  const bannerBgSection = document.querySelector('.banner-background-section');
  const overOnsCloseBtn = document.querySelector('.over-ons-close-btn');

  // Toggle panel when "Meer over ons" button is clicked
  if (bannerBgCtaBtnElement && overOnsPanel) {
    bannerBgCtaBtnElement.addEventListener('click', () => {
      console.log("📋 Meer over ons button clicked");
      
      if (isOverOnsPanelAnimating) return;
      
      if (!isOverOnsPanelOpen) {
        openOverOnsPanel();
      } else {
        closeOverOnsPanel();
      }
    });
  }

  // Close panel when close button is clicked (tablet and mobile)
  if (overOnsCloseBtn) {
    overOnsCloseBtn.addEventListener('click', () => {
      console.log("❌ Over ons close button clicked");
      
      if (isOverOnsPanelAnimating) return;
      
      if (isOverOnsPanelOpen) {
        closeOverOnsPanel();
      }
    });
  }

  function openOverOnsPanel() {
    isOverOnsPanelAnimating = true;
    
    console.log("📋 Opening Over Ons panel from left, pushing content to the right");
    
    // First, quickly scroll the section into perfect viewport position
    if (bannerBgSection) {
      const sectionRect = bannerBgSection.getBoundingClientRect();
      const sectionTop = window.pageYOffset + sectionRect.top;
      
      // Scroll to position the section perfectly in viewport
      lenis.scrollTo(sectionTop, {
        duration: 0.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
    }
    
    // Add 'panel-open' class to button to make it white with blue text (desktop only)
    if (bannerBgCtaBtnElement) {
      const isMobile = window.innerWidth <= 1000; // Tablet and mobile breakpoint
      if (!isMobile) {
        bannerBgCtaBtnElement.classList.add('panel-open');
      }
    }
    
    // No scroll lock for Over Ons panel
    
    // Wait for scroll to complete, then start panel animation
    setTimeout(() => {
      // Add 'panel-active' class to section to push content to the right (after scroll)
      if (bannerBgSection) {
        bannerBgSection.classList.add('panel-active');
      }
      
      // Create timeline for panel slide-in animation from left
      const tl = gsap.timeline();
      
      tl.to(overOnsPanel, {
        x: '0%',
        duration: 0.6,
        ease: "hop",
      onComplete: () => {
        // Change button text to "Minder" only on desktop when panel is fully opened with smooth transition
        if (bannerBgBtnText && bannerBgCtaBtnElement) {
          const isMobile = window.innerWidth <= 1000; // Tablet and mobile breakpoint
          
          if (!isMobile) {
            gsap.to(bannerBgBtnText, {
              opacity: 0,
              duration: 0.2,
              ease: "power2.out",
              onComplete: () => {
                bannerBgBtnText.textContent = 'Minder over ons';
                // Animate button width change
                gsap.to(bannerBgCtaBtnElement, {
                  scaleX: 0.8,
                  duration: 0.15,
                  ease: "power2.out",
                  onComplete: () => {
                    gsap.to(bannerBgCtaBtnElement, {
                      scaleX: 1,
                      duration: 0.15,
                      ease: "back.out(1.7)"
                    });
                  }
                });
                gsap.to(bannerBgBtnText, {
                  opacity: 1,
                  duration: 0.2,
                  ease: "power2.out"
                });
              }
            });
          }
        }
        isOverOnsPanelAnimating = false;
        isOverOnsPanelOpen = true;
        console.log("✅ Over Ons panel opened");
      }
    });
    }, 900); // Wait 900ms for scroll to complete
  }

  function closeOverOnsPanel() {
    isOverOnsPanelAnimating = true;
    
    console.log("📋 Closing Over Ons panel, pulling content back");
    
    // Remove 'panel-open' class from button (desktop only)
    if (bannerBgCtaBtnElement) {
      const isMobile = window.innerWidth <= 1000; // Tablet and mobile breakpoint
      if (!isMobile) {
        bannerBgCtaBtnElement.classList.remove('panel-open');
      }
    }
    
    // Remove 'panel-active' class from section to pull content back
    if (bannerBgSection) {
      bannerBgSection.classList.remove('panel-active');
    }
    
    // No scroll unlock needed for Over Ons panel
    
    // Create timeline for panel slide-out animation to left
    const tl = gsap.timeline();
    
    tl.to(overOnsPanel, {
      x: '-100%',
      duration: 0.6,
      ease: "hop",
      onComplete: () => {
        // Change button text back to "Meer over ons" only on desktop when panel is fully closed with smooth transition
        if (bannerBgBtnText && bannerBgCtaBtnElement) {
          const isMobile = window.innerWidth <= 1000; // Tablet and mobile breakpoint
          
          if (!isMobile) {
            gsap.to(bannerBgBtnText, {
              opacity: 0,
              duration: 0.2,
              ease: "power2.out",
              onComplete: () => {
                bannerBgBtnText.textContent = 'Meer over ons';
                // Animate button width change
                gsap.to(bannerBgCtaBtnElement, {
                  scaleX: 0.8,
                  duration: 0.15,
                  ease: "power2.out",
                  onComplete: () => {
                    gsap.to(bannerBgCtaBtnElement, {
                      scaleX: 1,
                      duration: 0.15,
                      ease: "back.out(1.7)"
                    });
                  }
                });
                gsap.to(bannerBgBtnText, {
                  opacity: 1,
                  duration: 0.2,
                  ease: "power2.out"
                });
              }
            });
          }
        }
        isOverOnsPanelAnimating = false;
        isOverOnsPanelOpen = false;
        console.log("✅ Over Ons panel closed");
      }
    });
  }

  // ========== COPY FUNCTIONALITY ==========
  // Function to handle copying
  async function handleCopy(element, textToCopy) {
    try {
      await navigator.clipboard.writeText(textToCopy);
      
      // Add success feedback
      element.classList.add('copied');
      
      // Remove the class after animation completes
      setTimeout(() => {
        element.classList.remove('copied');
      }, 2000);
      
      console.log(`✅ Copied to clipboard: ${textToCopy}`);
    } catch (err) {
      console.error('❌ Failed to copy:', err);
      
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        element.classList.add('copied');
        setTimeout(() => {
          element.classList.remove('copied');
        }, 2000);
        console.log(`✅ Copied to clipboard (fallback): ${textToCopy}`);
      } catch (fallbackErr) {
        console.error('❌ Fallback copy failed:', fallbackErr);
      }
      
      document.body.removeChild(textArea);
    }
  }
  
  // Copy icons functionality
  const copyIcons = document.querySelectorAll('.copy-icon');
  copyIcons.forEach(icon => {
    icon.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const textToCopy = icon.getAttribute('data-copy');
      await handleCopy(icon, textToCopy);
    });
  });
  
  // Copyable numbers functionality
  const copyableNumbers = document.querySelectorAll('.copyable-number');
  copyableNumbers.forEach(number => {
    number.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const textToCopy = number.getAttribute('data-copy');
      
      // Find the corresponding icon (next sibling button)
      const correspondingIcon = number.parentElement.querySelector(`.copy-icon[data-copy="${textToCopy}"]`);
      
      // Apply copied class to the number
      await handleCopy(number, textToCopy);
      
      // Also apply copied class to the icon
      if (correspondingIcon) {
        correspondingIcon.classList.add('copied');
        setTimeout(() => {
          correspondingIcon.classList.remove('copied');
        }, 2000);
      }
    });
  });

  // ========== BANNER BACKGROUND SECTION SCROLL LOCK ==========
  const bannerBackgroundSection = document.querySelector('.banner-background-section');
  
  // No scroll lock for banner background section
  if (bannerBackgroundSection) {
    console.log("✅ Banner background section initialized without scroll lock");
  }

  // ========== MENU COLOR CHANGE ON BANNER BACKGROUND SECTION ==========
  const menuToggleLabelText = document.querySelector('.menu-toggle-label p');
  const menuHamburgerSpans = document.querySelectorAll('.menu-hamburger-icon span');
  const menuHamburgerIconElement = document.querySelector('.menu-hamburger-icon');
  
  if (bannerBackgroundSection && menuToggleLabelText && menuHamburgerSpans.length > 0 && menuHamburgerIconElement) {
    ScrollTrigger.create({
      trigger: bannerBackgroundSection,
      start: "top 80px", // When section reaches the menu position
      end: "bottom 80px",
      onEnter: () => {
        // Change to white when entering the dark section - all at the same time
        const tl = gsap.timeline();
        tl.to(menuToggleLabelText, {
          color: '#FFFFFF',
          duration: 0.3,
          ease: "power2.out"
        }, 0)
        .to(menuHamburgerSpans, {
          backgroundColor: '#FFFFFF',
          duration: 0.3,
          ease: "power2.out"
        }, 0)
        .to(menuHamburgerIconElement, {
          borderColor: 'rgba(255, 255, 255, 0.3)',
          duration: 0.3,
          ease: "power2.out"
        }, 0);
      },
      onLeave: () => {
        // Change back to original color when leaving the section - all at the same time
        const tl = gsap.timeline();
        tl.to(menuToggleLabelText, {
          color: '#04295B',
          duration: 0.3,
          ease: "power2.out"
        }, 0)
        .to(menuHamburgerSpans, {
          backgroundColor: '#04295B',
          duration: 0.3,
          ease: "power2.out"
        }, 0)
        .to(menuHamburgerIconElement, {
          borderColor: 'rgba(4, 41, 91, 0.2)',
          duration: 0.3,
          ease: "power2.out"
        }, 0);
      },
      onEnterBack: () => {
        // Change to white when scrolling back into the section - all at the same time
        const tl = gsap.timeline();
        tl.to(menuToggleLabelText, {
          color: '#FFFFFF',
          duration: 0.3,
          ease: "power2.out"
        }, 0)
        .to(menuHamburgerSpans, {
          backgroundColor: '#FFFFFF',
          duration: 0.3,
          ease: "power2.out"
        }, 0)
        .to(menuHamburgerIconElement, {
          borderColor: 'rgba(255, 255, 255, 0.3)',
          duration: 0.3,
          ease: "power2.out"
        }, 0);
      },
      onLeaveBack: () => {
        // Change back to original color when scrolling back up past the section - all at the same time
        const tl = gsap.timeline();
        tl.to(menuToggleLabelText, {
          color: '#04295B',
          duration: 0.3,
          ease: "power2.out"
        }, 0)
        .to(menuHamburgerSpans, {
          backgroundColor: '#04295B',
          duration: 0.3,
          ease: "power2.out"
        }, 0)
        .to(menuHamburgerIconElement, {
          borderColor: 'rgba(4, 41, 91, 0.2)',
          duration: 0.3,
          ease: "power2.out"
        }, 0);
      }
    });
    
    console.log("✅ Menu color change on banner background section initialized");
  }

  console.log("✅ Telescope animation, menu, contact menu, text rotation and copy functionality initialized");
});