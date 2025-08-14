document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });
    
    // Booking card interactions
    const bookingCards = document.querySelectorAll('.booking-card');
    
    bookingCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.btn')) {
                this.classList.toggle('expanded');
            }
        });
    });
    
    // Button functionality
    document.addEventListener('click', function(e) {
        // Cancel booking button
        if (e.target.closest('.btn-outline') && e.target.closest('.btn-outline').textContent.includes('Cancel')) {
            const button = e.target.closest('.btn-outline');
            const card = button.closest('.booking-card');
            const venueName = card.querySelector('.venue-name').textContent;
            
            if (confirm(`Are you sure you want to cancel your booking for ${venueName}?`)) {
                const status = card.querySelector('.booking-status');
                status.textContent = 'Cancelled';
                status.className = 'booking-status status-cancelled';
                
                // Change buttons
                const actions = button.closest('.booking-actions');
                actions.innerHTML = `
                    <button class="btn btn-outline">
                        <i class="fas fa-redo"></i> Book Again
                    </button>
                `;
            }
        }
        
        // Book again button
        if (e.target.closest('.btn-outline') && e.target.closest('.btn-outline').textContent.includes('Book Again')) {
            const card = e.target.closest('.booking-card');
            const venueName = card.querySelector('.venue-name').textContent;
            alert(`Redirecting to book ${venueName} again...`);
        }
        
        // Share button
        if (e.target.closest('.btn-primary') && e.target.closest('.btn-primary').textContent.includes('Share')) {
            const card = e.target.closest('.booking-card');
            const venueName = card.querySelector('.venue-name').textContent;
            const date = card.querySelector('.detail-value').textContent;
            alert(`Sharing booking for ${venueName} on ${date}...`);
        }
        
        // Rate button
        if (e.target.closest('.btn-primary') && e.target.closest('.btn-primary').textContent.includes('Rate')) {
            const card = e.target.closest('.booking-card');
            const venueName = card.querySelector('.venue-name').textContent;
            alert(`Opening rating form for ${venueName}...`);
        }
    });
    
    // Initialize with first tab active
    document.querySelector('.tab.active').click();
});
