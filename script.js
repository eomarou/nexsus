document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add active class to current section in navigation
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('nav a');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 150) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === currentSection) {
                link.classList.add('active');
            }
        });
    });

    // Tracking functionality
    const trackForm = document.getElementById('track-form');
    const trackingResult = document.getElementById('tracking-result');

    if (trackForm) {
        trackForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const trackingNumber = this.querySelector('input').value.trim();
            
            if (!trackingNumber) {
                trackingResult.innerHTML = `
                    <div class="tracking-error">
                        <p>Please enter a tracking number.</p>
                    </div>
                `;
                return;
            }

            try {
                const response = await fetch(`http://localhost:5000/api/tracking/${trackingNumber}`);
                const data = await response.json();
                
                if (response.ok) {
                    const shipment = data;
                    trackingResult.innerHTML = `
                        <div class="tracking-success">
                            <h3>Tracking Information</h3>
                            <p><strong>Tracking Number:</strong> ${shipment.trackingNumber}</p>
                            <p><strong>Status:</strong> <span class="status-${shipment.status.toLowerCase()}">${shipment.status}</span></p>
                            <div class="tracking-timeline">
                                <div class="timeline-item ${shipment.status === 'Pending' ? 'active' : ''}">
                                    Order Received
                                </div>
                                <div class="timeline-item ${shipment.status === 'In Transit' ? 'active' : ''}">
                                    In Transit
                                </div>
                                <div class="timeline-item ${shipment.status === 'Delivered' ? 'active' : ''}">
                                    Delivered
                                </div>
                            </div>
                            <div class="tracking-updates">
                                <h4>Shipment Updates</h4>
                                ${shipment.updates.map(update => `
                                    <div class="update-item">
                                        <p><strong>Status:</strong> ${update.status}</p>
                                        <p><strong>Location:</strong> ${update.location}</p>
                                        <p><strong>Time:</strong> ${new Date(update.timestamp).toLocaleString()}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                } else {
                    trackingResult.innerHTML = `
                        <div class="tracking-error">
                            <p>No shipment found with tracking number: ${trackingNumber}</p>
                            <p>Please verify your tracking number and try again.</p>
                        </div>
                    `;
                }
            } catch (error) {
                trackingResult.innerHTML = `
                    <div class="tracking-error">
                        <p>Error fetching tracking information.</p>
                        <p>Please try again later.</p>
                    </div>
                `;
                console.error('Error:', error);
            }
        });
    }

    // Create New Shipment Form Handling
    const createShipmentForm = document.getElementById('create-shipment-form');
    const createShipmentResult = document.getElementById('create-shipment-result');

    if (createShipmentForm) {
        createShipmentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const recipientName = this.querySelector('input[placeholder="Recipient Name"]').value.trim();
            const recipientAddress = this.querySelector('input[placeholder="Recipient Address"]').value.trim();

            if (!recipientName || !recipientAddress) {
                createShipmentResult.innerHTML = `
                    <div class="tracking-error">
                        <p>Please fill in all fields.</p>
                    </div>
                `;
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/tracking/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        recipientName,
                        recipientAddress
                    })
                });
                const newShipment = await response.json();
                
                if (response.ok) {
                    createShipmentResult.innerHTML = `
                        <div class="tracking-success">
                            <h3>New Shipment Created</h3>
                            <p><strong>Tracking Number:</strong> ${newShipment.trackingNumber}</p>
                            <p><strong>Status:</strong> <span class="status-${newShipment.status.toLowerCase()}">${newShipment.status}</span></p>
                            <p>Use this tracking number to monitor your shipment status.</p>
                        </div>
                    `;
                } else {
                    createShipmentResult.innerHTML = `
                        <div class="tracking-error">
                            <p>Error creating shipment: ${newShipment.error}</p>
                        </div>
                    `;
                }
            } catch (error) {
                createShipmentResult.innerHTML = `
                    <div class="tracking-error">
                        <p>Error creating new shipment.</p>
                        <p>Please try again later.</p>
                    </div>
                `;
                console.error('Error:', error);
            }
        });
    }


    // Contact form handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            // Simulate form submission
            this.innerHTML = `
                <div class="success-message">
                    <h3>Thank you for contacting us!</h3>
                    <p>We will get back to you shortly.</p>
                </div>
            `;
        });
    }

    // Add scroll to top button functionality
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '↑';
    scrollBtn.className = 'scroll-top';
    document.body.appendChild(scrollBtn);

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Show/hide scroll button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.style.display = 'block';
        } else {
            scrollBtn.style.display = 'none';
        }
    });
});
