document.addEventListener('DOMContentLoaded', function() {
    // Initialize date picker
    const dateInput = flatpickr("#date-input", {
        minDate: "today",
        dateFormat: "Y-m-d",
        defaultDate: "2025-05-06",
        onChange: updateBookingDetails
    });

    // Initialize time picker
    const timeInput = flatpickr("#time-input", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "h:i K",
        defaultDate: "13:00",
        minuteIncrement: 30,
        onChange: updateBookingDetails
    });

    // Sport selection
    const sportSelect = document.getElementById('sport-select');
    sportSelect.addEventListener('change', function() {
        if(this.value) {
            this.style.color = 'var(--text-color)';
        } else {
            this.style.color = 'var(--light-text)';
        }
        updateBookingDetails();
    });

    // Initialize with placeholder styling
    sportSelect.style.color = 'var(--light-text)';

    // Duration selection
    const durationSelect = document.getElementById('duration-select');
    durationSelect.addEventListener('change', updateBookingDetails);

    // Court selection
    const courtSelect = document.getElementById('court-select');
    courtSelect.addEventListener('change', updateBookingDetails);

    // Player count controls
    const playerCount = document.getElementById('player-count');
    const minusBtn = document.querySelector('.player-btn.minus');
    const plusBtn = document.querySelector('.player-btn.plus');
    
    minusBtn.addEventListener('click', function() {
        let count = parseInt(playerCount.textContent);
        if (count > 1) {
            playerCount.textContent = count - 1;
            updateBookingDetails();
        }
    });
    
    plusBtn.addEventListener('click', function() {
        let count = parseInt(playerCount.textContent);
        playerCount.textContent = count + 1;
        updateBookingDetails();
    });

    // Payment button
    const paymentBtn = document.getElementById('payment-btn');
    paymentBtn.addEventListener('click', function() {
        alert('Proceeding to payment...');
        // In a real app, you would redirect to payment page
    });

    // Update booking details and price
    function updateBookingDetails() {
        // Calculate price based on selections
        const duration = parseInt(durationSelect.value);
        const players = parseInt(playerCount.textContent);
        const basePrice = 600; // Price per hour
        const totalPrice = basePrice * duration;
        
        // Update payment button
        paymentBtn.innerHTML = Continue to Payment - ₹${totalPrice}.00 <i class="fas fa-arrow-right"></i>;
    }

    // Initialize with default values
    updateBookingDetails();
});