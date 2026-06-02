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


function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');

    return `${day}/${month}/${year}`;
}

const form = document.getElementById('reservationForm');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;

    if (
        !selectedCheckin ||
        !selectedCheckout
    ) {

        alert(
            'Selecione as datas no calendário.'
        );

        return;
    }

    const checkin =
        formatDate(
            selectedCheckin
        );

    const checkout =
        formatDate(
            selectedCheckout
        );

    const message = document.getElementById('message').value;

    const whatsappNumber = '553584140888';

    const text = encodeURIComponent(
        `*Desejo realizar uma Reserva - Chalé Refúgio da Lua*

        Nome: ${name}
        WhatsApp: ${phone}
        Check-in: ${checkin}
        Check-out: ${checkout}

        Observações:
        ${message}`
    );

    window.open(
        `https://wa.me/${whatsappNumber}?text=${text}`,
        '_blank'
    );
});

let selectedCheckin = null;
let selectedCheckout = null;

// Calendário

document.addEventListener(
    'DOMContentLoaded',
    async function () {

        const calendarEl =
            document.getElementById(
                'calendar'
            );

        const AIRBNB_ICS =
            'https://www.airbnb.com.br/calendar/ical/1683650729866504217.ics?t=f53e1dfdd31640d6a6fa40cfac4a01f1';

        const PROXY =
            'https://corsproxy.io/?';

        async function loadAirbnbEvents() {

            const response =
                await fetch(
                    PROXY +
                    encodeURIComponent(
                        AIRBNB_ICS
                    )
                );

            const ics =
                await response.text();

            const events = [];

            const blocks =
                ics.split(
                    'BEGIN:VEVENT'
                );

            blocks.forEach(block => {

                const startMatch =
                    block.match(
                        /DTSTART;VALUE=DATE:(\d{8})/
                    );

                const endMatch =
                    block.match(
                        /DTEND;VALUE=DATE:(\d{8})/
                    );

                if (
                    !startMatch ||
                    !endMatch
                ) return;

                const start =
                    startMatch[1]
                        .replace(
                            /(\d{4})(\d{2})(\d{2})/,
                            '$1-$2-$3'
                        );

                const end =
                    endMatch[1]
                        .replace(
                            /(\d{4})(\d{2})(\d{2})/,
                            '$1-$2-$3'
                        );

                events.push({
                    title: 'Reservado',
                    start,
                    end,
                    display: 'block'
                });

            });

            return events;
        }

        const events =
            await loadAirbnbEvents();

        const occupiedDates = [];

        events.forEach(event => {

            let current =
                new Date(
                    event.start
                );

            const end =
                new Date(
                    event.end
                );

            while (
                current < end
            ) {

                occupiedDates.push(
                    current
                        .toISOString()
                        .split('T')[0]
                );

                current.setDate(
                    current.getDate() + 1
                );
            }

        });

        function clearSelectedDays() {
            document
                .querySelectorAll('.fc-day-selected')
                .forEach(el => el.classList.remove('fc-day-selected'));
        }

        function selectDay(dateStr) {
            const cell = document.querySelector(
                `[data-date="${dateStr}"]`
            );

            if (cell) {
                cell.classList.add('fc-day-selected');
            }
        }

        const calendar =
            new FullCalendar.Calendar(
                calendarEl,
                {

                    locale: 'pt-br',

                    initialView: 'dayGridMonth',

                    height: 'auto',

                    handleWindowResize: true,

                    windowResize() {
                        calendar.updateSize();
                    },

                    headerToolbar: {
                        left: 'prev,next',
                        center: 'title',
                        right: ''
                    },

                    events,

                    dateClick(info) {

                        const clickedDate = info.dateStr;

                        console.log("clickedDate:", clickedDate);
                        console.log("formatado:", formatDate(clickedDate));

                        // Não permite clicar em dia ocupado
                        if (occupiedDates.includes(clickedDate)) {
                            return;
                        }

                        // Clicou novamente no mesmo check-in → desmarca
                        if (
                            selectedCheckin === clickedDate &&
                            !selectedCheckout
                        ) {

                            selectedCheckin = null;
                            selectedCheckout = null;

                            const checkinEvent =
                                calendar.getEventById('checkin');

                            if (checkinEvent)
                                checkinEvent.remove();

                            const selectionEvent =
                                calendar.getEventById('selection');

                            if (selectionEvent)
                                selectionEvent.remove();

                            document.getElementById(
                                'selectedCheckin'
                            ).textContent =
                                'Não selecionado';

                            document.getElementById(
                                'selectedCheckout'
                            ).textContent =
                                'Não selecionado';

                            return;
                        }

                        // PRIMEIRO CLIQUE
                        if (!selectedCheckin) {

                            selectedCheckin = clickedDate;
                            selectedCheckout = null;

                            const oldSelection =
                                calendar.getEventById('selection');

                            if (oldSelection)
                                oldSelection.remove();

                            const oldCheckin =
                                calendar.getEventById('checkin');

                            if (oldCheckin)
                                oldCheckin.remove();

                            calendar.addEvent({
                                id: 'checkin',
                                start: clickedDate,
                                end: new Date(
                                    new Date(clickedDate).getTime()
                                    + 86400000
                                )
                                    .toISOString()
                                    .split('T')[0],
                                display: 'background',
                                backgroundColor: '#f6c667'
                            });

                            document.getElementById(
                                'selectedCheckin'
                            ).textContent =
                                formatDate(selectedCheckin);

                            document.getElementById(
                                'selectedCheckout'
                            ).textContent =
                                'Não selecionado';

                            return;
                        }

                        // SEGUNDO CLIQUE
                        if (!selectedCheckout) {

                            if (
                                new Date(clickedDate) <=
                                new Date(selectedCheckin)
                            ) {

                                alert(
                                    'A data de saída deve ser posterior ao check-in.'
                                );

                                return;
                            }

                            let current =
                                new Date(selectedCheckin);

                            const end =
                                new Date(clickedDate);

                            while (current < end) {

                                const date =
                                    current
                                        .toISOString()
                                        .split('T')[0];

                                if (
                                    occupiedDates.includes(date)
                                ) {

                                    alert(
                                        'Existem datas ocupadas dentro desse período.'
                                    );

                                    return;
                                }

                                current.setDate(
                                    current.getDate() + 1
                                );
                            }

                            selectedCheckout =
                                clickedDate;

                            const nights =
                                Math.ceil(
                                    (
                                        new Date(selectedCheckout) -
                                        new Date(selectedCheckin)
                                    ) / 86400000
                                );

                            document.getElementById(
                                'selectedCheckin'
                            ).textContent =
                                formatDate(
                                    selectedCheckin
                                );

                            document.getElementById(
                                'selectedCheckout'
                            ).textContent =
                                `${formatDate(selectedCheckout)} (${nights} noites)`;

                            const oldCheckin =
                                calendar.getEventById('checkin');

                            if (oldCheckin)
                                oldCheckin.remove();

                            const oldSelection =
                                calendar.getEventById('selection');

                            if (oldSelection)
                                oldSelection.remove();

                            calendar.addEvent({

                                id: 'selection',

                                start:
                                    selectedCheckin,

                                end:
                                    new Date(
                                        new Date(
                                            selectedCheckout
                                        ).getTime()
                                        + 86400000
                                    )
                                        .toISOString()
                                        .split('T')[0],

                                display:
                                    'background',

                                backgroundColor:
                                    '#f6c667'
                            });

                            return;
                        }

                        // TERCEIRO CLIQUE
                        // Reinicia seleção

                        const oldSelection =
                            calendar.getEventById(
                                'selection'
                            );

                        if (oldSelection)
                            oldSelection.remove();

                        const oldCheckin =
                            calendar.getEventById(
                                'checkin'
                            );

                        if (oldCheckin)
                            oldCheckin.remove();

                        selectedCheckin =
                            clickedDate;

                        selectedCheckout =
                            null;

                        calendar.addEvent({
                            id: 'checkin',
                            start: clickedDate,
                            end: new Date(
                                new Date(clickedDate).getTime()
                                + 86400000
                            )
                                .toISOString()
                                .split('T')[0],
                            display: 'background',
                            backgroundColor: '#f6c667'
                        });

                        document.getElementById(
                            'selectedCheckin'
                        ).textContent =
                            formatDate(
                                selectedCheckin
                            );

                        document.getElementById(
                            'selectedCheckout'
                        ).textContent =
                            'Não selecionado';
                    }
                }
            );

        calendar.render();
    }
);