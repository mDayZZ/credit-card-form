const cardForm = document.querySelector('#card-form')
const cardNumberInput = document.querySelector('#card__number-input')
const cardHolderInput = document.querySelector('#card__holder-input')
const cardExpDateInput = document.querySelector('#card__exp-date-input')
const cardCvvInput = document.querySelector('#card__cvv-input')
const cardLogo = document.querySelector('#card_logo')
const cardLogoAnimationTime = window.getComputedStyle(cardLogo).animationDuration.replace(/[ms]/g,'')
const dateNow = new Date(Date.now())
const yearNow = dateNow.getFullYear()
const monthNow = dateNow.getMonth() + 1


let cardNumberValid = false;
let cardHolderValid = false;
let cardExpDateValid = false;

const formDataToJson = (formData) => {
    const json = {};
    formData.forEach((value, key) => {
        json[key] = value.trim();
    });
    json['card_number'] = json['card_number'].replace(/ /g, '')
    return JSON.stringify(json);
};

const akaFetch = (data) => {
    const result = {
        ok: false,
        status: 404,
    }
    return new Promise((resolve, rejected) => {
        setTimeout(() => {
            if (data) {
                result.ok = true;
                result.status = 200;
                resolve(result)
            } else {
                rejected(result)
            }
        }, 3000)
    })
}


const sendData = () => {
    const statusElement = document.querySelector('#card__status')
    statusElement.hidden = true
    if(
        cardForm.checkValidity()
        // cardNumberInput.checkValidity() &&
        // cardHolderInput.checkValidity() &&
        // cardExpDateInput.checkValidity() &&
        // cardCvvInput.checkValidity()
    ) {
        createOverlayElement()
        const formData = new FormData(cardForm)
        const jsonData = formDataToJson(formData)
        console.log(jsonData)

        akaFetch(jsonData)
            .then(response => {
                console.log(response)
                createSuccessfullyOverlayElement()
                setTimeout(()=>{
                    location.reload()
                }, 5000)


            })
            .catch(response => {
                statusElement.textContent = 'Ошибка сервера'
                statusElement.hidden = false;

                console.log(response)
            })
            .finally(() => {
                hideOverlay()
            })
    }
    else {
        cardForm.reportValidity()
        statusElement.textContent = 'Ошибка: Проверьте поля ввода'
        statusElement.hidden = false;
    }

}

cardNumberInput.addEventListener('input', function (event) {
    let value = event.target.value;
    const selectionStart = this.selectionStart;
    const selectionEnd = this.selectionEnd;
    value = value.replace(/\D/g, '');
    if (value.length > 0) {
        if (value[0] === '4'){
            if(!cardLogo.src.includes('logo-visa.png')) {
                console.log(cardLogo.src)
                changeLogo('./images/logo-visa.png')
            }
        } else if (value[0] === '5'){
            if(!cardLogo.src.includes('logo-mastercard.png')) {
                changeLogo('./images/logo-mastercard.png')
            }
        } else if (value.length > 1 && value.slice(0, 2) === '22') {
            if ( !cardLogo.src.includes('logo-mir.png')) {
                changeLogo('./images/logo-mir.png')
            }
        } else changeLogo('./images/logo-empty.png', true)
    } else changeLogo('./images/logo-empty.png', true)
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ')

    if(value.length < 19) {
        this.classList.remove('card__input--valid')
        this.classList.add('card__input--not-valid')
    }
    else {
        this.classList.remove('card__input--not-valid')
        this.classList.add('card__input--valid')
    }

    event.target.value = value
    if (selectionStart === selectionEnd) {
        if (selectionStart % 5 === 0){
            this.setSelectionRange(selectionStart+1, selectionStart+1)
        } else {
            this.setSelectionRange(selectionStart, selectionStart)
        }

    }

})

cardHolderInput.addEventListener('input', function(event) {
    let value = event.target.value;
    value = value.replace(/[^a-zA-Z ]/g, '')
    value = value.toUpperCase()
    value = value.replace(/ {2}/, ' ')
    event.target.value = value
})

cardExpDateInput.addEventListener('input', function (event) {
    let value = event.target.value;
    const selectionStart = this.selectionStart;
    const selectionEnd = this.selectionEnd;
    let monthValid = false;
    let yearValid = false;
    let isYearNow = false;
    value = value.replace(/\D/g, '')
    value = value.replace(/(\d{2})(?=\d)/g, '$1/')
    if (value.length === 5) {
        const year = +value.slice(3,5)
        if (year < +String(yearNow).slice(2,4)) {
            yearValid = false
            isYearNow = false
            this.setCustomValidity('Неправильный год')
            this.reportValidity()
            console.log('badYear')
        }
        else if (year === +String(yearNow).slice(2,4)) {
            isYearNow = true;
            yearValid = true;
        }


        else {
            yearValid = true;
        }
    }
    else isYearNow = false;

    if (value.length > 1) {
        const month = +value.slice(0,2)
        if (month < 1 || month > 12 || (month < monthNow && isYearNow === true)) {
            this.setCustomValidity('Неправильный месяц')
            this.reportValidity()
            monthValid = false;
        } else {
            monthValid = true;
            this.setCustomValidity('')
        }
    }


    console.log('now:', monthNow, yearNow, 'isYearNow:', isYearNow)
    console.log('valid month/year', monthValid, yearValid)

    if (monthValid && yearValid) {
        this.classList.remove('card__input--not-valid')
        this.classList.add('card__input--valid')
    } else {
        this.classList.remove('card__input--valid')
        this.classList.add('card__input--not-valid')
    }
    event.target.value = value

    if (selectionStart === selectionEnd) {
        if (selectionStart === 3) {
            this.setSelectionRange(selectionStart+1, selectionStart+1)

        }else {
            this.setSelectionRange(selectionStart, selectionStart)

        }

    }
})

cardCvvInput.addEventListener('input', function (event) {
    let value = event.target.value;
    value = value.replace(/\D/g, '')
    event.target.value = value;

    if (this.value.length === 3) {
        this.classList.remove('card__input--not-valid')
        this.classList.add('card__input--valid')
        this.setCustomValidity('')
    } else {
        this.classList.remove('card__input--valid')
        this.classList.add('card__input--not-valid')
        this.setCustomValidity('CVV должен содержать 3 цифры')
    }

})

function changeLogo(newSrc, dontShow = false) {
    const divider = dontShow ?1 :2
    // Добавляем класс hidden для запуска анимации исчезания
    if (cardLogo.classList.contains('visible')) {
        cardLogo.classList.remove('visible')
        cardLogo.classList.add('hidden');
    }


    // Ждем немного времени, чтобы анимация завершилась
    setTimeout(function () {
        // Меняем src изображения
        cardLogo.src = newSrc;

        // Удаляем класс hidden и добавляем класс visible для запуска анимации появления
        if (!dontShow){
            cardLogo.classList.remove('hidden');
            cardLogo.classList.add('visible');
        }
    }, cardLogoAnimationTime * 1000 / divider); // 300 миллисекунд - это время, равное продолжительности анимации в CSS
}

const createOverlayElement = function () {
    const overlayElement = document.createElement('div')
    overlayElement.id = 'overlay'
    overlayElement.classList.add('overlay')
    overlayElement.innerHTML = '<div class="loader"></div>'


    document.body.insertAdjacentElement('afterbegin' ,overlayElement)
}

function hideOverlay() {
    const overlay = document.getElementById('overlay');
    if (overlay) {
        document.body.removeChild(overlay);
    }
}

const createSuccessfullyOverlayElement = function () {
    const successfullyOverlayElement = document.createElement('div')
    successfullyOverlayElement.id = 'successfullyOverlay'
    successfullyOverlayElement.classList.add('successfullyOverlay')
    successfullyOverlayElement.innerHTML = `
                <h1 class="success__title">Успешно</h1>
                <div class="successLogo">
                    <div class="success__checkmark"></div>
                    <div class="success__round"></div>
                </div>`


    document.body.insertAdjacentElement('afterbegin' ,successfullyOverlayElement)
}
