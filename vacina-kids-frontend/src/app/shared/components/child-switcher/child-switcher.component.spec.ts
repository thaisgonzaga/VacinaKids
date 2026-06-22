import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildSwitcherComponent } from './child-switcher.component';
import { Child } from '../../../models';

function child(id: string, nome = id): Child {
  return {
    id,
    uid: 'u1',
    nome,
    dataNascimento: '2024-01-01',
    corAvatar: '2',
    criadoEm: '2024-01-01T00:00:00.000Z',
  };
}

const dismissStub = { dismiss: () => undefined };

describe('ChildSwitcherComponent', () => {
  let component: ChildSwitcherComponent;
  let fixture: ComponentFixture<ChildSwitcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChildSwitcherComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChildSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('cria', () => {
    expect(component).toBeTruthy();
  });

  it('mapeia corAvatar para a variável CSS da paleta', () => {
    expect(component.cor(child('a'))).toBe('var(--vk-avatar-2)');
  });

  it('emite childChange ao selecionar uma criança', () => {
    const c = child('a');
    let emitido: Child | undefined;
    component.childChange.subscribe((v) => (emitido = v));

    component.selecionar(c, dismissStub);

    expect(emitido).toBe(c);
  });

  it('emite manage ao gerenciar', () => {
    let chamado = false;
    component.manage.subscribe(() => (chamado = true));

    component.gerenciar(dismissStub);

    expect(chamado).toBeTrue();
  });

  it('rótulo de acessibilidade reflete a criança ativa', () => {
    expect(component.rotuloAtivo()).toBe('Selecionar criança');
    fixture.componentRef.setInput('active', child('a', 'Ana'));
    expect(component.rotuloAtivo()).toBe('Criança ativa: Ana');
  });
});
