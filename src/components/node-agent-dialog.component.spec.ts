import { NodeAgentDialogComponent, INodeAgentDialogData } from './node-agent-dialog.component';
import { signal } from '@angular/core';

describe('NodeAgentDialogComponent Unit Suite', () => {
  let component: NodeAgentDialogComponent;

  const mockDialogData: INodeAgentDialogData = {
    nodeKey: 'med-001',
    nodeText: 'CYP2C19 Intermediate Metabolizer',
    sectionTitle: 'Pharmacogenomics Review'
  };

  beforeEach(() => {
    component = Object.create(NodeAgentDialogComponent.prototype);
    
    // Wire up signals and dependencies
    Object.assign(component, {
      data: signal(mockDialogData),
      patientData: signal(''),
      isOpen: signal(false),
      isLoading: signal(false),
      chatHistory: signal([]),
      showSuggestionsDropdown: signal(false),
      selectedFiles: signal([]),
      userInput: '',
      contextHtml: signal(''),
      isContextFlipped: signal(false),
      lastContextFlipTime: 0,
      permissionError: signal(null),
      suggestedQuestions: signal([]),
      position: signal(null),
      isDragging: signal(false),
      live: {
        disconnect: vi.fn(),
        isConnected: signal(false)
      }
    });
  });

  it('1. Instantiates successfully with input dialog data', () => {
    expect(component).toBeTruthy();
    expect(component.data()).toEqual(mockDialogData);
    expect(component.isOpen()).toBe(false);
    expect(component.isContextFlipped()).toBe(false);
  });

  it('2. Toggles context flip state with debounce guard', () => {
    component.toggleContextFlip();
    expect(component.isContextFlipped()).toBe(true);

    // Call immediately within debounce window -> should remain true
    component.toggleContextFlip();
    expect(component.isContextFlipped()).toBe(true);
  });

  it('3. Sets dialog open/close state signals', () => {
    component.isOpen.set(true);
    expect(component.isOpen()).toBe(true);
    component.isOpen.set(false);
    expect(component.isOpen()).toBe(false);
  });

  it('4. Updates draggable position signal', () => {
    expect(component.position()).toBeNull();
    component.position.set({ x: 120, y: 240 });
    expect(component.position()).toEqual({ x: 120, y: 240 });
  });

  it('5. Manages chat history entries', () => {
    expect(component.chatHistory()).toEqual([]);
    component.chatHistory.set([
      { role: 'user', text: 'What is the dosage adjustment?' },
      { role: 'model', text: 'Recommend Prasugrel alternative.' }
    ]);
    expect(component.chatHistory().length).toBe(2);
  });

  it('6. Cleans up active live session on ngOnDestroy', () => {
    component.ngOnDestroy();
    expect(component.live.disconnect).toHaveBeenCalled();
  });
});
