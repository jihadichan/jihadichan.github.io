document.querySelectorAll('.t0').forEach(mandarinDiv => {
    mandarinDiv.addEventListener('click', function() {
        // Find the parent element
        const parentDiv = this.parentElement;

        // Find the pinyin (t1) and english (t2) elements within this parent
        const pinyinDiv = parentDiv.querySelector('.t1');
        const englishDiv = parentDiv.querySelector('.t2');

        // Check current visibility status
        const isHidden = getComputedStyle(pinyinDiv).display === 'none';

        // Toggle visibility of the pinyin and english elements
        if (pinyinDiv) {
            pinyinDiv.style.display = isHidden ? 'block' : 'none';
        }

        if (englishDiv) {
            englishDiv.style.display = isHidden ? 'block' : 'none';
        }
    });
});
