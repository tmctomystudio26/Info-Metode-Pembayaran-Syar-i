document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('audio-player');
    const playButton = document.getElementById('play-btn');
    const playIcon = document.getElementById('play-icon');
    const timerElement = document.getElementById('timer');
    const realTimeElement = document.getElementById('real-time');
    const dateContainer = document.getElementById('date-container');
    const searchInput = document.getElementById('search-input');
    const rekeningContainer = document.getElementById('rekening-container');
    const prayerTimesContainer = document.querySelector('.prayer-times-container');
    const locationInfo = document.getElementById('location-info');

    let isPlaying = false;

    playButton.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            playIcon.src = 'https://raw.githubusercontent.com/tmctomystudio26/github.musik.io/main/images-removebg-preview.png';
        } else {
            audio.play();
            playIcon.src = 'https://raw.githubusercontent.com/tmctomystudio26/github.musik.io/main/568359.png';
        }
        isPlaying = !isPlaying;
    });

    // Update timer
    audio.addEventListener('timeupdate', () => {
        const currentTime = formatTime(audio.currentTime);
        const duration = formatTime(audio.duration);
        timerElement.textContent = `${currentTime} / ${duration}`;
    });

    // Format time in MM:SS
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // Update real-time clock
    function updateRealTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        realTimeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
    
    // Initialize real-time clock
    updateRealTime();
    setInterval(updateRealTime, 1000); // Update every second

    // Update date
    async function updateDate() {
        const now = new Date();
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        const dayName = days[now.getDay()];
        const day = String(now.getDate()).padStart(2, '0');
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        const dateStr = `${dayName}, ${day} ${month} ${year}`;
        
        // Fetch Hijri date
        try {
            const response = await fetch(`https://api.aladhan.com/v1/gToH?date=${year}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
            const data = await response.json();
            
            if (data && data.data && data.data.hijri) {
                const hijri = data.data.hijri;
                const hijriDate = `${hijri.weekday.ar} ${String(hijri.day).padStart(2, '0')} ${hijri.month.ar} ${hijri.year}`;
                dateContainer.innerHTML = `${dateStr} | ${hijriDate}`;
            } else {
                dateContainer.textContent = dateStr;
            }
        } catch (error) {
            console.error('Error fetching Hijri date:', error);
            dateContainer.textContent = dateStr;
        }
    }

    // Initialize date
    updateDate();

    // Filter rekening based on search input
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const rekeningItems = rekeningContainer.getElementsByClassName('rekening');
        
        Array.from(rekeningItems).forEach(item => {
            const name = item.dataset.name.toLowerCase();
            if (name.includes(query)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Fetch and display prayer times
    async function fetchPrayerTimes() {
        try {
            const response = await fetch('https://api.aladhan.com/v1/timings?latitude=-6.1751&longitude=106.8650&method=2');
            const data = await response.json();

            if (data && data.data && data.data.timings) {
                const prayerTimesData = data.data.timings;

                document.getElementById('imsyak').textContent = `Imsyak: ${prayerTimesData.Imsak}`;
                document.getElementById('fajr').textContent = `Subuh: ${prayerTimesData.Fajr}`;
                document.getElementById('dhuhr').textContent = `Dzuhur: ${prayerTimesData.Dhuhr}`;
                document.getElementById('asr').textContent = `Ashar: ${prayerTimesData.Asr}`;
                document.getElementById('maghrib').textContent = `Maghrib: ${prayerTimesData.Maghrib}`;
                document.getElementById('isha').textContent = `Isya: ${prayerTimesData.Isha}`;
            } else {
                prayerTimesContainer.innerHTML = '<p>Data jadwal sholat tidak tersedia.</p>';
            }
        } catch (error) {
            console.error('Error fetching prayer times:', error);
            prayerTimesContainer.innerHTML = '<p>Error fetching prayer times. Silakan coba lagi nanti.</p>';
        }
    }

    // Initialize prayer times
    fetchPrayerTimes();

    // Fetch and display location info
    function fetchLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                // Reverse geocoding using Nominatim API
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                    const data = await response.json();
                    const location = data.display_name || `Latitude: ${latitude.toFixed(4)}, Longitude: ${longitude.toFixed(4)}`;
                    locationInfo.textContent = location;
                } catch (error) {
                    console.error('Error fetching location name:', error);
                    locationInfo.textContent = 'Nama lokasi tidak tersedia.';
                }
            }, (error) => {
                console.error('Error getting location:', error);
                locationInfo.textContent = 'Lokasi tidak tersedia, silakan aktifkan setelan lokasi !';
            });
        } else {
            locationInfo.textContent = 'Geolocation tidak didukung oleh browser ini.';
        }
    }

    // Initialize location info
    fetchLocation();

    // Running text at the top
    const runningTextElement = document.createElement('div');
    runningTextElement.className = 'running-text';
    runningTextElement.innerHTML = `الوَقْتُ كَالسَّيْفِ، إِنْ لَـمْ تَقْطَعْهُ قَطَعَكَ | Waktu itu ibarat pedang, apabila engkau tidak memanfaatkannya, ia akan memenggalmu.`;
    document.body.insertBefore(runningTextElement, document.body.firstChild);

    // Update running text style
    const style = document.createElement('style');
    style.textContent = `
        .running-text {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: #000;
            color: #fff;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            padding: 5px 0;
            white-space: nowrap;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            animation: marquee 10s linear infinite;
           }
           
           @keyframes marquee {
               0% { transform: translateX(100%); }
               100% { transform: translateX(-100%); }
           }
           
           .prayer-times-container {
               display: flex;
               flex-wrap: wrap;
               gap: 10px;
               margin: 20px 0;
           }
           
           .prayer-time-box {
               background: #f0f0f0;
               border: 1px solid #ccc;
               border-radius: 5px;
               padding: 10px;
               text-align: center;
               flex: 1 1 calc(20% - 10px);
               box-shadow: 0 2px 4px rgba(0,0,0,0.1);
           }

           .prayer-times-title {
               font-size: 14px;
               margin-bottom: 10px;
           }

           #location-info {
               font-size: 12px;
               color: #000000;
               margin-top: 10px;
               font-weight: bold; /* Menjadikan teks bold */
           }
       `;
       document.head.appendChild(style);
   });


                                                                                                                 
