document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('textarea');
    const lineNumbersEle = document.getElementById('line-numbers');
    const container = document.getElementById('container');
    const dropMask = document.getElementById('dropMask');

    // Add drag and drop event listeners to the container
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);

    // Show the mask when a file is being dragged over the container
    container.addEventListener('dragenter', () => {
        dropMask.style.opacity = '1';
    });

    // Hide the mask when the file is no longer being dragged over the container
    container.addEventListener('dragleave', () => {
        dropMask.style.opacity = '0';
    });

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files[0];
        const reader = new FileReader();

        reader.onload = function (event) {
            const fileContent = event.target.result;
            textarea.value = fileContent;
            displayLineNumbers();
        };

        reader.readAsText(file);
        dropMask.style.opacity = '0';
    }

    const textareaStyles = window.getComputedStyle(textarea);
    [
        'fontFamily',
        'fontSize',
        'fontWeight',
        'letterSpacing',
        'lineHeight',
        'padding',
    ].forEach((property) => {
        lineNumbersEle.style[property] = textareaStyles[property];
    });

    const parseValue = (v) => v.endsWith('px') ? parseInt(v.slice(0, -2), 10) : 0;

    const font = `${textareaStyles.fontSize} ${textareaStyles.fontFamily}`;
    const paddingLeft = parseValue(textareaStyles.paddingLeft);
    const paddingRight = parseValue(textareaStyles.paddingRight);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;

    const calculateNumLines = (str) => {
        const textareaWidth = textarea.getBoundingClientRect().width - paddingLeft - paddingRight;
        const words = str.split(' ');
        let lineCount = 0;
        let currentLine = '';
        for (let i = 0; i < words.length; i++) {
            const wordWidth = context.measureText(words[i] + ' ').width;
            const lineWidth = context.measureText(currentLine).width;

            if (lineWidth + wordWidth > textareaWidth) {
                lineCount++;
                currentLine = words[i] + ' ';
            } else {
                currentLine += words[i] + ' ';
            }
        }

        if (currentLine.trim() !== '') {
            lineCount++;
        }

        return lineCount;
    };

    const calculateLineNumbers = () => {
        const lines = textarea.value.split('\n');
        const numLines = lines.map((line) => calculateNumLines(line));

        let lineNumbers = [];
        let i = 1;
        while (numLines.length > 0) {
            const numLinesOfSentence = numLines.shift();
            lineNumbers.push(i);
            if (numLinesOfSentence > 1) {
                Array(numLinesOfSentence - 1)
                    .fill('')
                    .forEach((_) => lineNumbers.push(''));
            }
            i++;
        }

        return lineNumbers;
    };

    const displayLineNumbers = () => {
        const lineNumbers = calculateLineNumbers();
        lineNumbersEle.innerHTML = Array.from({
            length: lineNumbers.length
        }, (_, i) => `<div>${lineNumbers[i] || '&nbsp;'}</div>`).join('');
    };

    textarea.addEventListener('input', () => {
        displayLineNumbers();
    });

    displayLineNumbers();

    const ro = new ResizeObserver(() => {
        const rect = textarea.getBoundingClientRect();
        lineNumbersEle.style.height = `${rect.height}px`;
        displayLineNumbers();
    });
    ro.observe(textarea);

    textarea.addEventListener('scroll', () => {
        lineNumbersEle.scrollTop = textarea.scrollTop;
    });
});