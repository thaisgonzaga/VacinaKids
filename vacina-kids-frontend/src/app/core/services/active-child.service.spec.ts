import { TestBed } from '@angular/core/testing';

import { ActiveChildService } from './active-child.service';
import { Child } from '../../models';

const STORAGE_KEY = 'vk.activeChildId';

function child(id: string, nome = id): Child {
  return {
    id,
    uid: 'u1',
    nome,
    dataNascimento: '2024-01-01',
    corAvatar: '1',
    criadoEm: '2024-01-01T00:00:00.000Z',
  };
}

describe('ActiveChildService', () => {
  let service: ActiveChildService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActiveChildService);
  });

  afterEach(() => localStorage.clear());

  it('inicia sem criança ativa', () => {
    expect(service.active()).toBeNull();
    expect(service.activeId()).toBeNull();
  });

  it('selecionar define a ativa e persiste o id', () => {
    const c = child('a');
    service.selecionar(c);

    expect(service.active()).toBe(c);
    expect(service.activeId()).toBe('a');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('a');
  });

  it('selecionar(null) limpa a persistência', () => {
    service.selecionar(child('a'));
    service.selecionar(null);

    expect(service.active()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('sincronizar com lista vazia zera a seleção', () => {
    service.selecionar(child('a'));
    service.sincronizar([]);

    expect(service.active()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('sincronizar mantém a ativa atual quando ela ainda existe', () => {
    const b = child('b');
    service.selecionar(b);
    service.sincronizar([child('a'), b, child('c')]);

    expect(service.activeId()).toBe('b');
  });

  it('sincronizar recupera a seleção pelo id persistido no boot', () => {
    localStorage.setItem(STORAGE_KEY, 'c');
    // instância nova: não tem ativa em memória, só o id persistido.
    const fresh = TestBed.inject(ActiveChildService);
    fresh.sincronizar([child('a'), child('b'), child('c')]);

    expect(fresh.activeId()).toBe('c');
  });

  it('sincronizar cai na primeira da lista quando o id persistido sumiu', () => {
    localStorage.setItem(STORAGE_KEY, 'inexistente');
    service.sincronizar([child('a'), child('b')]);

    expect(service.activeId()).toBe('a');
  });
});
