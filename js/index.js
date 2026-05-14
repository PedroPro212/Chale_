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


const phoneInput = document.getElementById('phone');

phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');

    value = value.substring(0, 11);

    if (value.length > 10) {
        value = value.replace(
            /^(\d{2})(\d{5})(\d{4}).*/,
            '($1) $2-$3'
        );
    } else if (value.length > 6) {
        value = value.replace(
            /^(\d{2})(\d{4})(\d{0,4}).*/,
            '($1) $2-$3'
        );
    } else if (value.length > 2) {
        value = value.replace(
            /^(\d{2})(\d{0,5}).*/,
            '($1) $2'
        );
    } else {
        value = value.replace(
            /^(\d*)/,
            '($1'
        );
    }

    e.target.value = value;
});


const form = document.getElementById('reservationForm');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const message = document.getElementById('message').value;

    const whatsappNumber = '553584140888';

    const text =
        `🏡 *Nova Reserva - Chalé Refúgio da Lua*%0A%0A` +
        `👤 Nome: ${name}%0A` +
        `📱 WhatsApp: ${phone}%0A` +
        `📅 Check-in: ${checkin}%0A` +
        `📅 Check-out: ${checkout}%0A%0A` +
        `📝 Observações:%0A${message}`;

    window.open(
        `https://wa.me/${whatsappNumber}?text=${text}`,
        '_blank'
    );
});