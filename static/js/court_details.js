document.addEventListener('DOMContentLoaded', function() {
    // Gallery navigation
    const galleryDots = document.querySelectorAll('.gallery-dots .dot');
    const prevBtn = document.querySelector('.nav-btn.prev');
    const nextBtn = document.querySelector('.nav-btn.next');
    let currentSlide = 0;
    
    function updateGallery() {
        // Remove active class from all dots
        galleryDots.forEach(dot => dot.classList.remove('active'));
        
        // Add active class to current dot
        galleryDots[currentSlide].classList.add('active');
    }
    
    // Next slide
    nextBtn.addEventListener('click', function() {
        currentSlide = (currentSlide + 1) % galleryDots.length;
        updateGallery();
    });
    
    // Previous slide
    prevBtn.addEventListener('click', function() {
        currentSlide = (currentSlide - 1 + galleryDots.length) % galleryDots.length;
        updateGallery();
    });
    
    // Dot navigation
    galleryDots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            currentSlide = index;
            updateGallery();
        });
    });
    
    // Book Now button
    const bookNowBtn = document.querySelector('.book-now-btn');
    bookNowBtn.addEventListener('click', function() {
        alert('Redirecting to booking page...');
        // In a real app, you would redirect to booking page
    });
    
    // View All Reviews button
    const viewAllBtn = document.querySelector('.view-all-btn');
    const reviewCards = document.querySelectorAll('.review-card');
    
    // Initially hide all but the first 2 reviews
    for (let i = 2; i < reviewCards.length; i++) {
        reviewCards[i].style.display = 'none';
    }
    
    viewAllBtn.addEventListener('click', function() {
        // Toggle display of all reviews
        const isExpanded = viewAllBtn.dataset.expanded === 'true';
        
        if (isExpanded) {
            // Collapse
            for (let i = 2; i < reviewCards.length; i++) {
                reviewCards[i].style.display = 'none';
            }
            viewAllBtn.innerHTML = 'View All Reviews <i class="fas fa-chevron-down"></i>';
            viewAllBtn.dataset.expanded = 'false';
        } else {
            // Expand
            for (let i = 2; i < reviewCards.length; i++) {
                reviewCards[i].style.display = 'block';
            }
            viewAllBtn.innerHTML = 'Show Less <i class="fas fa-chevron-up"></i>';
            viewAllBtn.dataset.expanded = 'true';
        }
    });
    
    // Initialize
    updateGallery();
    viewAllBtn.dataset.expanded = 'false';
});