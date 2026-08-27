class ConfiguratorState {
    constructor(data) {
        this.data = data;
        this.state = {};

        // Initialize default state
        this.data.options.forEach(opt => {
            this.state[opt.id] = opt.default;
        });

        // Parse URL params for pre-configured build
        this.loadFromURL();
    }

    loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        const buildCode = params.get('build');
        if (buildCode) {
            try {
                const decodedState = JSON.parse(atob(buildCode));
                this.state = { ...this.state, ...decodedState };
            } catch (e) {
                console.error("Invalid build code");
            }
        }
    }

    getBuildCode() {
        return btoa(JSON.stringify(this.state));
    }

    setValue(optionId, value) {
        this.state[optionId] = value;
        // Trigger auto-corrections based on dependencies
        this.enforceDependencies();
    }

    enforceDependencies() {
        // Simple logic: If a selection violates a dependency, reset it to the first allowed value
        this.data.dependencies.forEach(rule => {
            if (this.state[rule.trigger] === rule.value) {
                if (!rule.allowedValues.includes(this.state[rule.target])) {
                    this.state[rule.target] = rule.allowedValues[0];
                }
            }
        });
    }

    getAllowedValues(optionId) {
        const option = this.data.options.find(o => o.id === optionId);
        if (!option || !option.values) return null;

        let allowed = [...option.values];

        // Filter based on rules
        this.data.dependencies.forEach(rule => {
            if (rule.target === optionId && this.state[rule.trigger] === rule.value) {
                allowed = allowed.filter(v => rule.allowedValues.includes(v));
            }
        });

        return allowed;
    }

    calculateTotal() {
        let total = this.data.basePrice;

        this.data.options.forEach(opt => {
            if (opt.surcharges && opt.surcharges[this.state[opt.id]]) {
                total += opt.surcharges[this.state[opt.id]];
            }
        });

        // Multiply by quantity
        total = total * (this.state.amount || 1);

        return total;
    }
}

// UI Controller
document.addEventListener('DOMContentLoaded', () => {
    if (typeof CONFIGURATOR_DATA === 'undefined') return;

    const state = new ConfiguratorState(CONFIGURATOR_DATA);
    const container = document.getElementById('options-container');

    // Initial Render
    renderOptions();
    updateVisuals();
    updatePrice();

    function renderOptions() {
        container.innerHTML = '';

        CONFIGURATOR_DATA.options.forEach(opt => {
            const group = document.createElement('div');
            group.className = 'option-group';

            const label = document.createElement('h3');
            label.className = 'text-sm font-bold uppercase tracking-wider mb-3 text-gray-300';
            label.textContent = opt.name;
            group.appendChild(label);

            if (opt.type === 'number') {
                const input = document.createElement('input');
                input.type = 'number';
                input.min = opt.min;
                input.value = state.state[opt.id];
                input.className = 'bg-black border border-gray-700 text-white p-2 rounded w-24';
                input.addEventListener('change', (e) => handleSelect(opt.id, parseInt(e.target.value)));
                group.appendChild(input);
            }
            else if (opt.type === 'text') {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = state.state[opt.id];
                input.placeholder = 'e.g. SMITH 99';
                input.className = 'bg-black border border-gray-700 text-white p-2 rounded w-full max-w-xs uppercase';
                input.addEventListener('input', (e) => handleSelect(opt.id, e.target.value));
                group.appendChild(input);
            }
            else if (opt.type === 'select') {
                const btnGrid = document.createElement('div');
                btnGrid.className = 'grid grid-cols-2 sm:grid-cols-3 gap-2';

                const allowedValues = state.getAllowedValues(opt.id);

                opt.values.forEach(val => {
                    const btn = document.createElement('button');
                    let priceText = '';
                    if (opt.surcharges && opt.surcharges[val]) {
                        priceText = ` (+€${opt.surcharges[val]})`;
                    }

                    btn.textContent = val + priceText;
                    btn.className = `option-button ${state.state[opt.id] === val ? 'active' : ''} ${!allowedValues.includes(val) ? 'disabled' : ''}`;

                    btn.addEventListener('click', () => handleSelect(opt.id, val));
                    btnGrid.appendChild(btn);
                });
                group.appendChild(btnGrid);
            }

            container.appendChild(group);
        });
    }

    function handleSelect(optionId, value) {
        state.setValue(optionId, value);
        // Re-render UI because dependencies might have changed other options
        renderOptions();
        updateVisuals();
        updatePrice();
    }

    function updateVisuals() {
        // Mock visual update logic based on state
        const textureLayer = document.getElementById('layer-texture');
        const selectedTexture = state.state['shaft3dTexture'];

        if (selectedTexture === 'Diagonal' && CONFIGURATOR_DATA.images.textures['Diagonal']) {
            textureLayer.src = CONFIGURATOR_DATA.images.textures['Diagonal'];
            textureLayer.classList.remove('hidden');
        } else {
            textureLayer.classList.add('hidden');
        }
    }

    function updatePrice() {
        document.getElementById('total-price').textContent = `€${state.calculateTotal().toFixed(2)}`;
    }

    // Modal & Buttons Logic
    document.getElementById('btn-overview').addEventListener('click', () => {
        const list = document.getElementById('summary-list');
        list.innerHTML = '';

        CONFIGURATOR_DATA.options.forEach(opt => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="text-gray-500">${opt.name}:</span> <span class="text-white">${state.state[opt.id]}</span>`;
            list.appendChild(li);
        });

        document.getElementById('build-code-display').textContent = state.getBuildCode();
        document.getElementById('overview-modal').classList.remove('hidden');
    });

    document.getElementById('close-overview').addEventListener('click', () => {
        document.getElementById('overview-modal').classList.add('hidden');
    });

    document.getElementById('btn-checkout').addEventListener('click', () => {
        alert("Mock: Adding to Shopify Cart...\nBuild Code: " + state.getBuildCode());
    });

    document.getElementById('btn-pdf').addEventListener('click', () => {
        alert("Mock: Generating PDF via jsPDF/html2pdf...\nThis would render the visualizer and summary to a downloadable document.");
    });
});