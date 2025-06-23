/* global VT */
window.VT = window.VT || {};

/**
 * Initializes a todo list component.
 * @param {HTMLElement} el - The root container for the todo list.
 */
VT.TodoList = function (el) {
  const state = {
    items: [],
  };

  // Initial HTML template
  el.innerHTML = `
    <div class="items"></div>
    <div class="todo-item-input"></div>
  `;

  const container = el.querySelector('.items');
  const inputContainer = el.querySelector('.todo-item-input');

  VT.AppSortable(container, {});
  VT.TodoItemInput(inputContainer);

  el.addEventListener('sortableDrop', (e) => {
    el.dispatchEvent(
      new CustomEvent('moveItem', {
        detail: {
          item: e.detail.data.item,
          index: e.detail.index,
        },
        bubbles: true,
      })
    );
  });

  /**
   * Updates the list UI based on new state.
   * @param {{ items: Array }} next - The new state with task items.
   */
  function update(next) {
    Object.assign(state, next);

    const existingItems = Array.from(container.children);
    const existingByKey = new Map();

    existingItems.forEach((child) => {
      existingByKey.set(child.dataset.key, child);
    });

    const fragment = document.createDocumentFragment();

    state.items.forEach((item) => {
      let child = existingByKey.get(item.id);
      if (child) {
        existingByKey.delete(item.id); // Mark as used
      } else {
        child = document.createElement('div');
        child.className = 'todo-item';
        child.dataset.key = item.id;
        VT.TodoItem(child);
      }
      child.todoItem.update({ item });
      fragment.appendChild(child);
    });

    // Remove old nodes
    existingByKey.forEach((unusedChild) => {
      container.removeChild(unusedChild);
    });

    // Clear and batch-insert updated nodes
    container.innerHTML = '';
    container.appendChild(fragment);
  }

  el.todoList = {
    update,
  };
};

