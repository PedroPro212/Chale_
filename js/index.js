const hiddenElements = document.querySelectorAll('.hidden');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                }
            });
        });

        hiddenElements.forEach((el) => observer.observe(el));

        document.querySelectorAll('.btn').forEach((btn) => {
            btn.addEventListener('mousemove', (e) => {
                const x = e.offsetX;
                const y = e.offsetY;

                btn.style.backgroundPosition = `${x}px ${y}px`;
            });
        });

        const form = document.getElementById('reservationForm');

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const checkin = document.getElementById('checkin').value;
            const checkout = document.getElementById('checkout').value;
            const adults = document.getElementById('adults').value;
            const children = document.getElementById('children').value;
            const message = document.getElementById('message').value;

            // ALTERE PARA O SEU NÚMERO
            const whatsappNumber = '5511999999999';

            const text =
                `🏡 *Nova Reserva - Chalé Nascer do Sol*%0A%0A` +
                `👤 Nome: ${name}%0A` +
                `📱 WhatsApp: ${phone}%0A` +
                `📅 Check-in: ${checkin}%0A` +
                `📅 Check-out: ${checkout}%0A` +
                `🧑 Adultos: ${adults}%0A` +
                `👶 Crianças: ${children}%0A%0A` +
                `📝 Observações:%0A${message}`;

            window.open(
                `https://wa.me/${whatsappNumber}?text=${text}`,
                '_blank'
            );
        });