
// Đối tượng validator
function Validator(option) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }


    var selectorRules = {}

    // Lấy element của form cần validate
    let formElement = document.querySelector(option.form);

    // hàm thực hiện validate
    function validate(inputElement, rule) {
        let errorElement = getParent(inputElement, option.formGroupSelector).querySelector(option.errorSelector)
        let errorMessage;
        
        // Lấy ra các rules của selector
        let rules = selectorRules[rule.selector];

        // Lặp qua từng rule và kiểm tra 
        // Có lỗi thì dừng việc kiểm tra
        for (let i = 0; i < rules.length; i++) { 
            errorMessage = rules[i](inputElement.value);
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, option.formGroupSelector).classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getParent(inputElement, option.formGroupSelector).classList.remove('invalid');
        }

        return !errorMessage;
    }

    if (formElement) {
        formElement.onsubmit = function (e) {
            e.preventDefault();
            
            let isFormValid = true;

            // Lặp qua từng rules và validate 
            option.rules.forEach(rule => {
                let inputElement = formElement.querySelector(rule.selector);
                let isValid = validate(inputElement, rule);

                if (!isValid) isFormValid = false;
            })

            if (isFormValid) {
                // Trường hợp submit với javascript
                if (typeof option.onSubmit === 'function') {
                    let enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    let formValue = Array.from(enableInputs).reduce((values, input) => {
                        values[input.name] = input.value;
                        return values;
                    }, {})
                    console.log(formValue);
                }
                // Trường hợp submit với form mặc định
                else {
                    formElement.onSubmit()
                }
            }
        }


        // Lặp qua mỗi rule và xử lý (lắng nghe sự kieenjblur, input,...)
        option.rules.forEach(rule => {
            let inputElement = formElement.querySelector(rule.selector)

            // Lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            if (inputElement) {
                // Xử lý trường hợp blur khỏi input
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                }

                // Xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement, option.formGroupSelector).querySelector(option.errorSelector)
                    errorElement.innerText = '';
                    getParent(inputElement, option.formGroupSelector).classList.remove('invalid');
                }
            }
        })
    }
}

// Định nghĩa rules
// Nguyên tắc của các rules:
// 1. Khi có lỗi => trả ra messae lỗi
// 1. Khi hợp lệ => trae về undefined
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này'
        }
    };
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là email'
        }
    };
}

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`
        }
    };
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}