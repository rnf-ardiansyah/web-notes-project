// Catat.In - Aplikasi Catatan dengan Fitur Sampah
// Versi: 4.0 (Template HTML sepenuhnya dipisahkan)

// State Management
let notes = JSON.parse(localStorage.getItem('catat-in-notes')) || [];
let currentEditId = null;
let currentDeleteId = null;
let currentRestoreId = null;
let selectedCategory = 'work';
let currentFilter = 'all';
let currentView = 'grid';
let isCreatingNote = false;

// DOM Elements
const elements = {
    // Containers
    notesContainer: document.getElementById('notes-container'),
    createNoteCard: document.getElementById('create-note-card'),
    sectionTitle: document.getElementById('section-title'),
    
    // Inputs
    noteTitle: document.getElementById('note-title'),
    noteContent: document.getElementById('note-content'),
    
    // Buttons
    addNoteBtn: document.getElementById('add-note-btn'),
    fabAddNote: document.getElementById('fab-add-note'),
    cancelCreateNote: document.getElementById('cancel-create-note'),
    
    // Search
    searchInput: document.getElementById('search-notes'),
    clearSearch: document.getElementById('clear-search'),
    
    // Filters
    categoryFilters: document.querySelectorAll('.category-filter, .category-filter-btn'),
    filterBadge: document.getElementById('filter-badge'),
    
    // View Options
    viewOptions: document.querySelectorAll('.view-option'),
    
    // Modals
    editModal: document.getElementById('edit-modal'),
    trashModal: document.getElementById('trash-modal'),
    deletePermanentlyModal: document.getElementById('delete-permanently-modal'),
    emptyTrashModal: document.getElementById('empty-trash-modal'),
    restoreModal: document.getElementById('restore-modal'),
    
    // Edit Modal
    editNoteTitle: document.getElementById('edit-note-title'),
    editNoteContent: document.getElementById('edit-note-content'),
    saveEditBtn: document.getElementById('save-edit-btn'),
    cancelEdit: document.getElementById('cancel-edit'),
    closeEditModal: document.getElementById('close-edit-modal'),
    
    // Trash Modal
    closeTrashModal: document.getElementById('close-trash-modal'),
    cancelTrash: document.getElementById('cancel-trash'),
    confirmTrash: document.getElementById('confirm-trash'),
    
    // Delete Permanently Modal
    closeDeletePermanentlyModal: document.getElementById('close-delete-permanently-modal'),
    cancelDeletePermanently: document.getElementById('cancel-delete-permanently'),
    confirmDeletePermanently: document.getElementById('confirm-delete-permanently'),
    
    // Empty Trash Modal
    closeEmptyTrashModal: document.getElementById('close-empty-trash-modal'),
    cancelEmptyTrash: document.getElementById('cancel-empty-trash'),
    confirmEmptyTrash: document.getElementById('confirm-empty-trash'),
    
    // Restore Modal
    closeRestoreModal: document.getElementById('close-restore-modal'),
    cancelRestore: document.getElementById('cancel-restore'),
    confirmRestore: document.getElementById('confirm-restore'),
    
    // Stats
    totalNotes: document.getElementById('total-notes'),
    pinnedNotes: document.getElementById('pinned-notes'),
    trashNotes: document.getElementById('trash-notes'),
    mobileTrashCount: document.getElementById('mobile-trash-count'),
    desktopTrashCount: document.getElementById('desktop-trash-count'),
    notesCount: document.getElementById('notes-count'),
    
    // Theme
    themeToggle: document.getElementById('theme-toggle'),
    
    // Mobile Menu
    menuToggle: document.getElementById('menu-toggle'),
    closeSidebar: document.getElementById('close-sidebar'),
    mobileSidebar: document.getElementById('mobile-sidebar'),
    
    // Toast
    toast: document.getElementById('toast'),
    
    // Templates
    noteCardTemplate: document.getElementById('note-card-template'),
    pinIndicatorTemplate: document.getElementById('pin-indicator-template'),
    emptyStateTemplate: document.getElementById('empty-state-template'),
    emptyTrashTemplate: document.getElementById('empty-trash-template'),
    trashActionsTemplate: document.getElementById('trash-actions-template'),
    notesGridTemplate: document.getElementById('notes-grid-template'),
    notesListTemplate: document.getElementById('notes-list-template')
};

// Initialize Application
function init() {
    loadNotes();
    setupEventListeners();
    setupTheme();
    updateStats();
    renderNotes();
}

// Load notes from localStorage
function loadNotes() {
    const saved = localStorage.getItem('catat-in-notes');
    if (saved) {
        notes = JSON.parse(saved);
    }
}

// Save notes to localStorage
function saveNotes() {
    localStorage.setItem('catat-in-notes', JSON.stringify(notes));
    updateStats();
}

// Setup all event listeners
function setupEventListeners() {
    // Add note
    elements.addNoteBtn.addEventListener('click', addNote);
    elements.fabAddNote.addEventListener('click', toggleCreateNoteCard);
    elements.cancelCreateNote.addEventListener('click', hideCreateNoteCard);
    
    // Enter key to add note
    elements.noteTitle.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            elements.noteContent.focus();
        }
    });
    
    elements.noteContent.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            addNote();
        }
    });
    
    // Category selection for new note
    document.querySelectorAll('.create-note-card .category-option').forEach(option => {
        option.addEventListener('click', function() {
            // Hapus active dari semua kategori
            document.querySelectorAll('.create-note-card .category-option').forEach(opt => {
                opt.classList.remove('active');
            });
            
            // Set active ke kategori yang diklik
            this.classList.add('active');
            selectedCategory = this.dataset.category;
        });
    });
    
    // Category selection for edit modal
    document.querySelectorAll('#edit-modal .category-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Hapus class active dari semua kategori di modal edit
            document.querySelectorAll('#edit-modal .category-option').forEach(opt => {
                opt.classList.remove('active');
            });
            
            // Tambahkan class active ke kategori yang diklik
            this.classList.add('active');
        });
    });
    
    // Search
    elements.searchInput.addEventListener('input', debounce(() => {
        renderNotes();
        updateClearSearchButton();
    }, 300));
    
    elements.clearSearch.addEventListener('click', clearSearch);
    
    // Filters
    elements.categoryFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            setFilter(filter.dataset.category);
        });
    });
    
    // View options
    elements.viewOptions.forEach(option => {
        option.addEventListener('click', () => {
            setView(option.dataset.view);
        });
    });
    
    // Edit modal
    elements.saveEditBtn.addEventListener('click', saveEditedNote);
    elements.cancelEdit.addEventListener('click', closeEditModal);
    elements.closeEditModal.addEventListener('click', closeEditModal);
    
    // Trash modal
    elements.cancelTrash.addEventListener('click', closeTrashModal);
    elements.closeTrashModal.addEventListener('click', closeTrashModal);
    elements.confirmTrash.addEventListener('click', confirmMoveToTrash);
    
    // Delete permanently modal
    elements.cancelDeletePermanently.addEventListener('click', closeDeletePermanentlyModal);
    elements.closeDeletePermanentlyModal.addEventListener('click', closeDeletePermanentlyModal);
    elements.confirmDeletePermanently.addEventListener('click', confirmDeletePermanently);
    
    // Empty trash modal
    elements.cancelEmptyTrash.addEventListener('click', closeEmptyTrashModal);
    elements.closeEmptyTrashModal.addEventListener('click', closeEmptyTrashModal);
    elements.confirmEmptyTrash.addEventListener('click', confirmEmptyTrash);
    
    // Restore modal
    elements.cancelRestore.addEventListener('click', closeRestoreModal);
    elements.closeRestoreModal.addEventListener('click', closeRestoreModal);
    elements.confirmRestore.addEventListener('click', confirmRestoreNote);
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Mobile menu
    elements.menuToggle.addEventListener('click', () => {
        elements.mobileSidebar.classList.add('active');
    });
    
    elements.closeSidebar.addEventListener('click', () => {
        elements.mobileSidebar.classList.remove('active');
    });
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === elements.editModal) closeEditModal();
        if (e.target === elements.trashModal) closeTrashModal();
        if (e.target === elements.deletePermanentlyModal) closeDeletePermanentlyModal();
        if (e.target === elements.emptyTrashModal) closeEmptyTrashModal();
        if (e.target === elements.restoreModal) closeRestoreModal();
        if (e.target === elements.mobileSidebar) {
            elements.mobileSidebar.classList.remove('active');
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Click outside to close create note card
    document.addEventListener('click', (e) => {
        if (isCreatingNote && 
            !elements.createNoteCard.contains(e.target) && 
            !elements.fabAddNote.contains(e.target) &&
            !e.target.closest('.btn-primary')) {
            hideCreateNoteCard();
        }
    });
}

// Toggle create note card
function toggleCreateNoteCard() {
    if (isCreatingNote) {
        hideCreateNoteCard();
    } else {
        showCreateNoteCard();
    }
}

// Show create note card
function showCreateNoteCard() {
    isCreatingNote = true;
    elements.createNoteCard.classList.add('active');
    elements.fabAddNote.innerHTML = '<i class="fas fa-times"></i>';
    elements.fabAddNote.classList.add('active');
    
    // Scroll to create section on mobile
    if (window.innerWidth <= 768) {
        elements.createNoteCard.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
    
    // Focus on title input
    setTimeout(() => {
        elements.noteTitle.focus();
    }, 100);
}

// Hide create note card
function hideCreateNoteCard() {
    isCreatingNote = false;
    elements.createNoteCard.classList.remove('active');
    elements.fabAddNote.innerHTML = '<i class="fas fa-plus"></i>';
    elements.fabAddNote.classList.remove('active');
    clearCreateForm();
}

// Set selected category for new note
function setSelectedCategory(category) {
    selectedCategory = category;
    
    // Update UI for new note category options
    document.querySelectorAll('.create-note-card .category-option').forEach(option => {
        option.classList.toggle('active', option.dataset.category === category);
    });
}

// Set filter
function setFilter(category) {
    currentFilter = category;
    
    // Update active filter
    elements.categoryFilters.forEach(filter => {
        filter.classList.toggle('active', filter.dataset.category === category);
    });
    
    // Update filter badge
    updateFilterBadge();
    
    // Update section title
    updateSectionTitle();
    
    // Close mobile sidebar
    elements.mobileSidebar.classList.remove('active');
    
    // Render notes
    renderNotes();
}

// Update filter badge
function updateFilterBadge() {
    const filterNames = {
        'all': 'Semua',
        'pinned': 'Disematkan',
        'work': 'Pekerjaan',
        'ideas': 'Ide & Inspirasi',
        'shopping': 'Belanja',
        'daily': 'Keseharian',
        'other': 'Lainnya',
        'trash': 'Sampah'
    };
    
    elements.filterBadge.textContent = filterNames[currentFilter] || 'Semua';
    elements.filterBadge.classList.add('active');
}

// Update section title
function updateSectionTitle() {
    const titles = {
        'all': '<i class="fas fa-sticky-note"></i> Catatan Anda',
        'pinned': '<i class="fas fa-thumbtack"></i> Catatan Disematkan',
        'work': '<i class="fas fa-briefcase"></i> Catatan Pekerjaan',
        'ideas': '<i class="fas fa-lightbulb"></i> Catatan Ide & Inspirasi',
        'shopping': '<i class="fas fa-shopping-cart"></i> Catatan Belanja',
        'daily': '<i class="fas fa-calendar-day"></i> Catatan Keseharian',
        'other': '<i class="fas fa-ellipsis-h"></i> Catatan Lainnya',
        'trash': '<i class="fas fa-trash"></i> Sampah'
    };
    
    elements.sectionTitle.innerHTML = titles[currentFilter] || titles['all'];
}

// Set view (grid/list)
function setView(view) {
    currentView = view;
    
    // Update active view
    elements.viewOptions.forEach(option => {
        option.classList.toggle('active', option.dataset.view === view);
    });
    
    // Re-render notes
    renderNotes();
}

// Update clear search button visibility
function updateClearSearchButton() {
    elements.clearSearch.style.display = elements.searchInput.value ? 'block' : 'none';
}

// Add new note
function addNote() {
    const title = elements.noteTitle.value.trim();
    const content = elements.noteContent.value.trim();
    
    if (!title && !content) {
        showToast('Catatan harus memiliki judul atau konten', 'error');
        return;
    }
    
    const newNote = {
        id: Date.now(),
        title: title || 'Catatan Tanpa Judul',
        content: content,
        category: selectedCategory,
        color: getCategoryColor(selectedCategory),
        pinned: false,
        deleted: false,
        deletedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    notes.unshift(newNote);
    saveNotes();
    renderNotes();
    hideCreateNoteCard();
    
    showToast('Catatan berhasil ditambahkan', 'success');
}

// Get category color
function getCategoryColor(category) {
    const colors = {
        'pinned': '#FFB74D',
        'work': '#FFE082',
        'ideas': '#90CAF9',
        'shopping': '#A5D6A7',
        'daily': '#EF9A9A',
        'other': '#B39DDB',
        'trash': '#BDBDBD'
    };
    
    return colors[category] || '#E2E8F0';
}

// Get category name
function getCategoryName(category) {
    const names = {
        'pinned': 'Disematkan',
        'work': 'Pekerjaan',
        'ideas': 'Ide & Inspirasi',
        'shopping': 'Belanja',
        'daily': 'Keseharian',
        'other': 'Lainnya',
        'trash': 'Sampah'
    };
    
    return names[category] || 'Lainnya';
}

// Get category icon
function getCategoryIcon(category) {
    const icons = {
        'pinned': 'fas fa-thumbtack',
        'work': 'fas fa-briefcase',
        'ideas': 'fas fa-lightbulb',
        'shopping': 'fas fa-shopping-cart',
        'daily': 'fas fa-calendar-day',
        'other': 'fas fa-ellipsis-h',
        'trash': 'fas fa-trash'
    };
    
    return icons[category] || 'fas fa-sticky-note';
}

// Clear create form
function clearCreateForm() {
    elements.noteTitle.value = '';
    elements.noteContent.value = '';
    setSelectedCategory('work');
}

// Render notes based on filter and search
function renderNotes() {
    const searchTerm = elements.searchInput.value.toLowerCase();
    let filteredNotes = filterNotes(notes, searchTerm);
    
    // Sort notes (pinned first, then by date)
    filteredNotes = sortNotes(filteredNotes);
    
    // Clear container
    elements.notesContainer.innerHTML = '';
    
    // Update empty state
    if (filteredNotes.length === 0) {
        createEmptyState();
    } else {
        renderNotesList(filteredNotes);
    }
    
    // Update notes count
    elements.notesCount.textContent = `${filteredNotes.length} catatan`;
}

// Filter notes
function filterNotes(notesList, searchTerm) {
    return notesList.filter(note => {
        // Apply deleted filter
        if (currentFilter === 'trash') {
            if (!note.deleted) return false;
        } else {
            if (note.deleted) return false;
        }
        
        // Apply search filter
        const matchesSearch = !searchTerm || 
            note.title.toLowerCase().includes(searchTerm) ||
            note.content.toLowerCase().includes(searchTerm);
        
        if (!matchesSearch) return false;
        
        // Apply category filter
        if (currentFilter === 'all' || currentFilter === 'trash') return true;
        if (currentFilter === 'pinned') return note.pinned === true;
        return note.category === currentFilter;
    });
}

// Sort notes
function sortNotes(notesList) {
    return [...notesList].sort((a, b) => {
        // Pinned notes first (only for non-trash)
        if (currentFilter !== 'trash') {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
        }
        
        // Then by date (newest first)
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
}

// Create empty state
function createEmptyState() {
    let template;
    
    if (currentFilter === 'trash') {
        template = elements.emptyTrashTemplate;
    } else {
        template = elements.emptyStateTemplate;
    }
    
    const clone = template.content.cloneNode(true);
    const emptyState = clone.querySelector('.empty-state');
    emptyState.classList.add('active');
    
    elements.notesContainer.appendChild(clone);
    
    // Add event listener to create first note button
    const createFirstNoteBtn = document.getElementById('create-first-note');
    if (createFirstNoteBtn) {
        createFirstNoteBtn.addEventListener('click', showCreateNoteCard);
    }
}

// Render notes list
function renderNotesList(filteredNotes) {
    // Add trash actions if in trash view
    if (currentFilter === 'trash') {
        const trashActions = createTrashActions();
        elements.notesContainer.appendChild(trashActions);
    }
    
    // Create notes container based on view
    let containerTemplate;
    if (currentView === 'grid') {
        containerTemplate = elements.notesGridTemplate;
    } else {
        containerTemplate = elements.notesListTemplate;
    }
    
    const containerClone = containerTemplate.content.cloneNode(true);
    const notesContainer = containerClone.querySelector('.notes-grid, .notes-list');
    
    // Add notes to container
    filteredNotes.forEach(note => {
        const noteCard = createNoteCard(note);
        notesContainer.appendChild(noteCard);
    });
    
    elements.notesContainer.appendChild(notesContainer);
    
    // Add event listeners to note cards
    attachNoteCardListeners();
    
    // Add event listener for empty trash button
    if (currentFilter === 'trash') {
        const emptyTrashBtn = document.getElementById('empty-trash-btn');
        if (emptyTrashBtn) {
            emptyTrashBtn.addEventListener('click', () => {
                if (notes.filter(n => n.deleted).length > 0) {
                    openEmptyTrashModal();
                }
            });
        }
    }
}

// Create note card from template
function createNoteCard(note) {
    const template = elements.noteCardTemplate;
    const clone = template.content.cloneNode(true);
    
    const noteCard = clone.querySelector('.note-card');
    noteCard.dataset.id = note.id;
    
    // Add classes based on note properties
    noteCard.classList.add(note.category);
    if (note.pinned && !note.deleted) {
        noteCard.classList.add('pinned');
        
        // Add pin indicator
        const pinIndicator = elements.pinIndicatorTemplate.content.cloneNode(true);
        noteCard.insertBefore(pinIndicator, noteCard.firstChild);
    }
    if (note.deleted) {
        noteCard.classList.add('deleted');
    }
    
    // Set title
    const titleElement = noteCard.querySelector('.note-title');
    titleElement.textContent = escapeHtml(note.title);
    
    // Set date
    const date = new Date(note.deleted ? note.deletedAt : note.updatedAt);
    const formattedDate = date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const dateElement = noteCard.querySelector('.note-date');
    dateElement.textContent = formattedDate;
    
    // Set content
    const contentElement = noteCard.querySelector('.note-content');
    contentElement.innerHTML = escapeHtml(note.content).replace(/\n/g, '<br>');
    
    // Set category
    const categoryIcon = noteCard.querySelector('.category-icon');
    const categoryName = noteCard.querySelector('.category-name');
    
    categoryIcon.className = getCategoryIcon(note.category);
    categoryName.textContent = getCategoryName(note.category);
    
    // Set action buttons
    const noteActions = noteCard.querySelector('.note-actions');
    noteActions.innerHTML = createActionButtonsHTML(note);
    
    return clone;
}

// Create action buttons HTML
function createActionButtonsHTML(note) {
    if (note.deleted) {
        return `
            <button class="note-action-btn restore-btn" title="Pulihkan catatan">
                <i class="fas fa-undo"></i>
            </button>
            <button class="note-action-btn delete-permanently-btn" title="Hapus permanen">
                <i class="fas fa-trash"></i>
            </button>
        `;
    } else {
        const pinClass = note.pinned ? 'pinned' : '';
        const pinTitle = note.pinned ? 'Lepas sematan' : 'Sematkan';
        
        return `
            <button class="note-action-btn edit-btn" title="Edit catatan">
                <i class="fas fa-edit"></i>
            </button>
            <button class="note-action-btn delete-btn" title="Pindahkan ke sampah">
                <i class="fas fa-trash"></i>
            </button>
            <button class="note-action-btn pin-btn ${pinClass}" title="${pinTitle}">
                <i class="fas fa-thumbtack"></i>
            </button>
        `;
    }
}

// Create trash actions from template
function createTrashActions() {
    const template = elements.trashActionsTemplate;
    const clone = template.content.cloneNode(true);
    
    const trashCount = notes.filter(n => n.deleted).length;
    const trashCountElement = clone.querySelector('.trash-count-text');
    trashCountElement.textContent = `${trashCount} catatan di sampah`;
    
    return clone;
}

// Attach event listeners to note cards
function attachNoteCardListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const noteId = parseInt(e.target.closest('.note-card').dataset.id);
            openEditModal(noteId);
        });
    });
    
    // Delete buttons (move to trash)
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const noteId = parseInt(e.target.closest('.note-card').dataset.id);
            openTrashModal(noteId);
        });
    });
    
    // Pin buttons
    document.querySelectorAll('.pin-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const noteId = parseInt(e.target.closest('.note-card').dataset.id);
            togglePin(noteId);
        });
    });
    
    // Restore buttons
    document.querySelectorAll('.restore-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const noteId = parseInt(e.target.closest('.note-card').dataset.id);
            openRestoreModal(noteId);
        });
    });
    
    // Delete permanently buttons
    document.querySelectorAll('.delete-permanently-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const noteId = parseInt(e.target.closest('.note-card').dataset.id);
            openDeletePermanentlyModal(noteId);
        });
    });
    
    // Expand/collapse content
    document.querySelectorAll('.note-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.note-actions')) {
                const content = card.querySelector('.note-content');
                content.classList.toggle('expanded');
            }
        });
    });
}

// Open edit modal
function openEditModal(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    currentEditId = noteId;
    
    elements.editNoteTitle.value = note.title;
    elements.editNoteContent.value = note.content;
    
    // Set kategori di modal edit
    const editCategoryOptions = document.querySelectorAll('#edit-modal .category-option');
    editCategoryOptions.forEach(option => {
        option.classList.remove('active');
        if (option.dataset.category === note.category) {
            option.classList.add('active');
        }
    });
    
    elements.editModal.style.display = 'flex';
    
    // Focus pada judul setelah modal ditampilkan
    setTimeout(() => {
        elements.editNoteTitle.focus();
    }, 100);
}

// Save edited note
function saveEditedNote() {
    const title = elements.editNoteTitle.value.trim();
    const content = elements.editNoteContent.value.trim();
    
    if (!title && !content) {
        showToast('Catatan harus memiliki judul atau konten', 'error');
        return;
    }
    
    const noteIndex = notes.findIndex(n => n.id === currentEditId);
    if (noteIndex === -1) return;
    
    // Ambil kategori yang aktif di modal edit
    const activeCategoryOption = document.querySelector('#edit-modal .category-option.active');
    if (!activeCategoryOption) {
        showToast('Pilih kategori terlebih dahulu', 'error');
        return;
    }
    
    const selectedEditCategory = activeCategoryOption.dataset.category;
    
    notes[noteIndex].title = title || 'Catatan Tanpa Judul';
    notes[noteIndex].content = content;
    notes[noteIndex].category = selectedEditCategory;
    notes[noteIndex].color = getCategoryColor(selectedEditCategory);
    notes[noteIndex].updatedAt = new Date().toISOString();
    
    saveNotes();
    renderNotes();
    closeEditModal();
    
    showToast('Catatan berhasil diperbarui', 'success');
}

// Close edit modal
function closeEditModal() {
    elements.editModal.style.display = 'none';
    currentEditId = null;
}

// Open trash modal
function openTrashModal(noteId) {
    currentDeleteId = noteId;
    elements.trashModal.style.display = 'flex';
}

// Close trash modal
function closeTrashModal() {
    elements.trashModal.style.display = 'none';
    currentDeleteId = null;
}

// Confirm move to trash
function confirmMoveToTrash() {
    const noteIndex = notes.findIndex(n => n.id === currentDeleteId);
    if (noteIndex === -1) return;
    
    // Mark as deleted
    notes[noteIndex].deleted = true;
    notes[noteIndex].deletedAt = new Date().toISOString();
    notes[noteIndex].pinned = false; // Unpin when moved to trash
    
    saveNotes();
    renderNotes();
    closeTrashModal();
    
    showToast('Catatan dipindahkan ke sampah', 'success');
}

// Open delete permanently modal
function openDeletePermanentlyModal(noteId) {
    currentDeleteId = noteId;
    elements.deletePermanentlyModal.style.display = 'flex';
}

// Close delete permanently modal
function closeDeletePermanentlyModal() {
    elements.deletePermanentlyModal.style.display = 'none';
    currentDeleteId = null;
}

// Confirm delete permanently
function confirmDeletePermanently() {
    const noteIndex = notes.findIndex(n => n.id === currentDeleteId);
    if (noteIndex === -1) return;
    
    // Remove from array
    notes.splice(noteIndex, 1);
    
    saveNotes();
    renderNotes();
    closeDeletePermanentlyModal();
    
    showToast('Catatan dihapus permanen', 'success');
}

// Open empty trash modal
function openEmptyTrashModal() {
    elements.emptyTrashModal.style.display = 'flex';
}

// Close empty trash modal
function closeEmptyTrashModal() {
    elements.emptyTrashModal.style.display = 'none';
}

// Confirm empty trash
function confirmEmptyTrash() {
    // Remove all deleted notes
    notes = notes.filter(n => !n.deleted);
    
    saveNotes();
    renderNotes();
    closeEmptyTrashModal();
    
    showToast('Sampah berhasil dikosongkan', 'success');
}

// Open restore modal
function openRestoreModal(noteId) {
    currentRestoreId = noteId;
    elements.restoreModal.style.display = 'flex';
}

// Close restore modal
function closeRestoreModal() {
    elements.restoreModal.style.display = 'none';
    currentRestoreId = null;
}

// Confirm restore note
function confirmRestoreNote() {
    const noteIndex = notes.findIndex(n => n.id === currentRestoreId);
    if (noteIndex === -1) return;
    
    // Restore note
    notes[noteIndex].deleted = false;
    notes[noteIndex].deletedAt = null;
    
    saveNotes();
    renderNotes();
    closeRestoreModal();
    
    showToast('Catatan berhasil dipulihkan', 'success');
}

// Toggle pin status
function togglePin(noteId) {
    const noteIndex = notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) return;
    
    notes[noteIndex].pinned = !notes[noteIndex].pinned;
    notes[noteIndex].updatedAt = new Date().toISOString();
    
    saveNotes();
    renderNotes();
    
    const action = notes[noteIndex].pinned ? 'disematkan' : 'dilepas';
    showToast(`Catatan berhasil ${action}`, 'success');
}

// Clear search
function clearSearch() {
    elements.searchInput.value = '';
    elements.clearSearch.style.display = 'none';
    renderNotes();
}

// Update statistics
function updateStats() {
    const total = notes.filter(n => !n.deleted).length;
    const pinned = notes.filter(n => n.pinned && !n.deleted).length;
    const trash = notes.filter(n => n.deleted).length;
    
    elements.totalNotes.textContent = total;
    elements.pinnedNotes.textContent = pinned;
    elements.trashNotes.textContent = trash;
    
    // Update trash counts with conditional display
    elements.mobileTrashCount.textContent = trash;
    elements.desktopTrashCount.textContent = trash;
    
    // Show trash badges only when there are items
    if (trash > 0) {
        elements.mobileTrashCount.classList.add('has-items');
        elements.desktopTrashCount.classList.add('has-items');
    } else {
        elements.mobileTrashCount.classList.remove('has-items');
        elements.desktopTrashCount.classList.remove('has-items');
    }
}

// Setup theme
function setupTheme() {
    const savedTheme = localStorage.getItem('catat-in-theme') || 'light';
    setTheme(savedTheme);
}

// Set theme
function setTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark-theme', isDark);
    localStorage.setItem('catat-in-theme', theme);
    
    // Update button icon
    const themeIcon = elements.themeToggle.querySelector('i');
    themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    elements.themeToggle.title = isDark ? 'Mode Terang' : 'Mode Gelap';
}

// Toggle theme
function toggleTheme() {
    const isDark = document.body.classList.contains('dark-theme');
    setTheme(isDark ? 'light' : 'dark');
    showToast(isDark ? 'Mode terang diaktifkan' : 'Mode gelap diaktifkan', 'success');
}

// Show toast notification
function showToast(message, type = 'success') {
    const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    const color = type === 'success' ? '#10B981' : '#EF4444';
    
    elements.toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    elements.toast.style.borderLeftColor = color;
    
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + N: New note
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        showCreateNoteCard();
    }
    
    // Ctrl/Cmd + F: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        elements.searchInput.focus();
    }
    
    // Escape: Close modals and hide create note
    if (e.key === 'Escape') {
        if (elements.editModal.style.display === 'flex') closeEditModal();
        if (elements.trashModal.style.display === 'flex') closeTrashModal();
        if (elements.deletePermanentlyModal.style.display === 'flex') closeDeletePermanentlyModal();
        if (elements.emptyTrashModal.style.display === 'flex') closeEmptyTrashModal();
        if (elements.restoreModal.style.display === 'flex') closeRestoreModal();
        if (isCreatingNote) hideCreateNoteCard();
        if (elements.mobileSidebar.classList.contains('active')) {
            elements.mobileSidebar.classList.remove('active');
        }
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize app
document.addEventListener('DOMContentLoaded', init);