// ==================== КОНФИГУРАЦИЯ ====================
const TELEGRAM_BOT_TOKEN = '8531904307:AAGwQ-dsKn8B32fSgPx8YoHrSXKM_COEvw0';
const TELEGRAM_CHAT_ID = '468095537';
const PHONE_NUMBER = "+7 (999) 123-45-67";

// ==================== ФУНКЦИИ ТЕЛЕГРАМ ====================
async function sendToTelegram(data) {
    let message = `🎉 НОВОЕ ПОДТВЕРЖДЕНИЕ ГОСТЯ\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `👤 ФИО: ${data.fullName}\n`;
    message += `📞 Телефон: ${data.phone}\n`;
    message += `✅ Присутствие: ${data.presence}\n`;
    message += `🍽 Блюдо: ${data.mainDish}\n`;
    message += `🚗 Трансфер: ${data.transfer}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📅 ${new Date().toLocaleString('ru-RU')}`;

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const result = await response.json();
        
        if (result.ok) {
            alert('✅ Спасибо! Ваша заявка успешно отправлена.');
            resetForm();
            return true;
        } else {
            console.error('Ошибка Telegram API:', result);
            throw new Error(result.description || 'Ошибка отправки');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('❌ Произошла ошибка при отправке. Пожалуйста, попробуйте позже.');
        return false;
    }
}

// ==================== ВАЛИДАЦИЯ ====================
function validateForm(formData) {
    if (!formData.fullName.trim()) {
        alert('❌ Пожалуйста, введите Фамилию и Имя гостя');
        return false;
    }
    if (!formData.phone.trim()) {
        alert('❌ Пожалуйста, введите номер телефона');
        return false;
    }
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
        alert('❌ Пожалуйста, введите корректный номер телефона (минимум 10 цифр)');
        return false;
    }
    if (!formData.mainDish) {
        alert('❌ Пожалуйста, выберите основное блюдо');
        return false;
    }
    if (!formData.transfer) {
        alert('❌ Пожалуйста, укажите, нужен ли трансфер');
        return false;
    }
    return true;
}

// ==================== СБОР ДАННЫХ ====================
function collectFormData() {
    const fullNameInput = document.querySelector('.fi[type="text"]');
    const phoneInput = document.querySelector('.fi[type="tel"]');
    const presenceSelect = document.querySelector('.presence');
    
    let mainDish = '';
    const selectedDish = document.querySelector('input[name="choice"]:checked');
    if (selectedDish) {
        mainDish = selectedDish.value === 'птица' ? 'Птица' : 
                   selectedDish.value === 'мясо' ? 'Мясо' : 
                   selectedDish.value === 'рыба' ? 'Рыба' : selectedDish.value;
    }
    
    let transfer = '';
    const selectedTransfer = document.querySelector('input[name="transf"]:checked');
    if (selectedTransfer) {
        transfer = selectedTransfer.value === 'да' ? 'Да' : 'Нет';
    }
    
    return {
        fullName: fullNameInput ? fullNameInput.value : '',
        phone: phoneInput ? phoneInput.value : '',
        presence: presenceSelect ? presenceSelect.value : '',
        mainDish: mainDish,
        transfer: transfer
    };
}

// ==================== ОТПРАВКА ФОРМЫ ====================
async function handleSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.querySelector('.ok');
    // ⚠️ НЕ меняем текст кнопки, только блокируем
    submitBtn.disabled = true;
    
    try {
        const formData = collectFormData();
        if (validateForm(formData)) {
            await sendToTelegram(formData);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('❌ Произошла ошибка. Попробуйте еще раз.');
    } finally {
        // ✅ Разблокируем кнопку, текст остался прежним
        submitBtn.disabled = false;
    }
}

// ==================== ОЧИСТКА ФОРМЫ ====================
function resetForm() {
    const fullNameInput = document.querySelector('.fi[type="text"]');
    const phoneInput = document.querySelector('.fi[type="tel"]');
    if (fullNameInput) fullNameInput.value = '';
    if (phoneInput) phoneInput.value = '';
    
    const presenceSelect = document.querySelector('.presence');
    if (presenceSelect) presenceSelect.selectedIndex = 0;
    
    const allRadios = document.querySelectorAll('input[type="radio"]');
    allRadios.forEach(radio => radio.checked = false);
}

// ==================== КОПИРОВАНИЕ НОМЕРА ====================
function copyPhoneNumber(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(PHONE_NUMBER).then(() => {
            showMessage('Номер скопирован! ✓', 'success');
        }).catch(() => {
            fallbackCopy(PHONE_NUMBER);
        });
    } else {
        fallbackCopy(PHONE_NUMBER);
    }
    
    return false;
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showMessage('Номер скопирован! ✓', 'success');
    } catch (err) {
        showMessage('Не удалось скопировать', 'error');
    }
    document.body.removeChild(textarea);
}

function showMessage(msg, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = msg;
    messageDiv.className = `message ${type}`;
    setTimeout(() => {
        messageDiv.className = 'message';
    }, 3000);
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('mainForm');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
    
    const copyBtn = document.getElementById('copyPhoneBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyPhoneNumber);
    }
    
    console.log('✅ Анкета загружена и готова к работе');
});