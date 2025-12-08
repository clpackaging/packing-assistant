const lengthInput = document.getElementById("lengthInput");
const widthInput = document.getElementById("widthInput");
const heightInput = document.getElementById("heightInput");
const quantityInput = document.getElementById("quantityInput");
const resultsEl = document.getElementById("results");
const calculateBtn = document.getElementById("calculateBtn");
const increaseQty = document.getElementById("increaseQty");
const decreaseQty = document.getElementById("decreaseQty");

// Quantity buttons
increaseQty.addEventListener("click", () => {
    quantityInput.value = parseInt(quantityInput.value) + 1;
    calculatePackaging();
});

decreaseQty.addEventListener("click", () => {
    quantityInput.value = Math.max(1, parseInt(quantityInput.value) - 1);
    calculatePackaging();
});

// Calculate on button click
calculateBtn.addEventListener("click", calculatePackaging);

// Live update on input change
[lengthInput, widthInput, heightInput, quantityInput].forEach(input => {
    input.addEventListener("input", calculatePackaging);
});

function calculatePackaging() {
    const L = parseFloat(lengthInput.value);
    const W = parseFloat(widthInput.value);
    const H = parseFloat(heightInput.value);
    const Q = parseInt(quantityInput.value) || 1;

    if (!L || !W || !H) {
        resultsEl.style.display = "none";
        return;
    }

    const boxes = [
        { name: "R1S", L: 50, W: 30, H: 38, link: "https://www.clpackaging.com/product-page/carton-box-rectangle" },
        { name: "R2S", L: 50, W: 25, H: 33, link: "https://www.clpackaging.com/product-page/carton-box-rectangle" },
        { name: "R3S", L: 43, W: 22, H: 30, link: "https://www.clpackaging.com/product-page/carton-box-rectangle" }
    ];

    const orientations = [
        [L, W, H],
        [L, H, W],
        [W, L, H],
        [W, H, L],
        [H, L, W],
        [H, W, L]
    ];

    let bestOption = null;

    for (let box of boxes) {
        let bestFit = { itemsPerBox: 0, orientation: null, freeVol: Infinity };
        orientations.forEach(o => {
            const [l, w, h] = o;
            if (l <= box.L && w <= box.W && h <= box.H) {
                const fitX = Math.floor(box.L / l);
                const fitY = Math.floor(box.W / w);
                const fitZ = Math.floor(box.H / h);
                const totalFit = fitX * fitY * fitZ;

                if (totalFit > bestFit.itemsPerBox ||
                    (totalFit === bestFit.itemsPerBox && ((box.L*box.W*box.H) - (l*w*h)) < bestFit.freeVol)) {
                    bestFit = { itemsPerBox: totalFit, orientation: { L: l, W: w, H: h }, freeVol: (box.L*box.W*box.H) - (l*w*h) };
                }
            }
        });

        if (bestFit.itemsPerBox > 0) {
            bestOption = { box, ...bestFit };
            break;
        }
    }

    if (!bestOption) {
        resultsEl.innerHTML = `<div class="card"><h4>No Suitable Box Found</h4><p>Your item is too large for R1S, R2S, or R3S.</p></div>`;
        resultsEl.style.display = "flex";
        return;
    }

    const totalBoxes = Math.ceil(Q / bestOption.itemsPerBox);
    const bubbleWidth = Math.min(L, W, H) <= 30 ? "30cm x 100m" : "50cm x 100m";
    const bubbleLengthPerItem = Math.ceil((bestOption.orientation.L + bestOption.orientation.W + bestOption.orientation.H) * 2);
    const totalBubbleMeters = Math.ceil(bubbleLengthPerItem * Q / 100);
    const bubbleRolls = Math.ceil(totalBubbleMeters / 100);    
    const tapePerItem = (bestOption.orientation.L + bestOption.orientation.W + bestOption.orientation.H) * 5/100; // meters
    const tapePerBox = (bestOption.box.L + bestOption.box.W + bestOption.box.H) * 5/100 * 2; // meters
    const totalTapeForItems = tapePerItem * Q; // Q = number of items
    const totalTapeForBoxes = tapePerBox * totalBoxes; // totalBoxes = Math.ceil(Q / itemsPerBox)
    const totalTapeMeters = totalTapeForItems + totalTapeForBoxes; 
    const tapeRollLengths = {
    18: 25, // 18mm width ~ 25 meters per roll
    32: 50  // 32mm width ~ 50 meters per roll
    };
    let remainingTape = totalTapeMeters;
    let tapeRolls32mm = Math.max(1, Math.ceil(remainingTape / tapeRollLengths[32]));
    remainingTape -= tapeRolls32mm * tapeRollLengths[32];
    let tapeRolls18mm = Math.max(1, Math.ceil(remainingTape / tapeRollLengths[18]));


    const html = `
        <div class="card">
            <h4><i class="fa fa-box"></i> Box Recommendation</h4>
            <div class="row"><span><i class="fa fa-box"></i> Box:</span><span>${bestOption.box.name} (${bestOption.box.L} × ${bestOption.box.W} × ${bestOption.box.H} cm)</span></div>
            <div class="row"><span><i class="fa fa-boxes"></i> Items per Box:</span><span>${bestOption.itemsPerBox}</span></div>
            <div class="row"><span><i class="fa fa-cubes"></i> Total Boxes:</span><span>${totalBoxes}</span></div>
            <div class="row"><span><i class="fa fa-cube"></i> Free Volume:</span><span>${bestOption.freeVol.toLocaleString()} cm³</span></div>
            <a class="buy-btn" href="https://www.clpackaging.com/product-page/carton-box-rectangle" target="_blank">Buy Carton Boxes</a>
            </div>

        <div class="card">
            <h4><i class="fa fa-arrows-up-down-left-right"></i> Item Orientation</h4>
            <div class="row"><span>L:</span><span>${bestOption.orientation.L} cm</span></div>
            <div class="row"><span>W:</span><span>${bestOption.orientation.W} cm</span></div>
            <div class="row"><span>H:</span><span>${bestOption.orientation.H} cm</span></div>
        </div>

        <div class="card">
            <h4><i class="fa fa-wrapping-paper"></i> Bubble Wrap</h4>
            <div class="row"><span>Bubble Wrap Dimensions:</span><span>${bubbleWidth}</span></div>
            <div class="row"><span>Total Length Needed:</span><span>~${totalBubbleMeters} meter(s)</span></div>
            <div class="row"><span>Number of Rolls Required:</span><span>${bubbleRolls} roll(s)</span></div>
            <a class="buy-btn" href="https://www.clpackaging.com/product-page/bubble-wrap" target="_blank">Buy Bubble Wrap</a>
        </div>

        <div class="card">
            <h4><i class="fa fa-scissors"></i> Tape</h4>
            <div class="row"><span>Required:</span><span>${totalTapeMeters} meters <br> ~${tapeRolls32mm}x Tape (50mm x 32mm) and ~${tapeRolls18mm}x Tape (50mm x 18mm)</span></div>
            <a class="buy-btn" href="https://www.clpackaging.com/product-page/tape-50mm" target="_blank">Buy Tape</a>
            </div>
    `;

    resultsEl.innerHTML = html;
    resultsEl.style.display = "flex";
}
