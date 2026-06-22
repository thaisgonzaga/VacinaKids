import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthPage } from './auth.page';
import { AuthService } from '../../core/services/auth.service';

describe('AuthPage', () => {
  let component: AuthPage;
  let fixture: ComponentFixture<AuthPage>;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj<AuthService>(
      'AuthService',
      ['login', 'signup', 'recuperarSenha', 'logout'],
      { user$: of(null) },
    );

    await TestBed.configureTestingModule({
      imports: [AuthPage],
      providers: [provideRouter([]), { provide: AuthService, useValue: authSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('cria e inicia no modo login', () => {
    expect(component).toBeTruthy();
    expect(component.mode()).toBe('login');
  });

  it('alterna entre os modos', () => {
    component.trocarModo('signup');
    expect(component.mode()).toBe('signup');
    component.trocarModo('forgot');
    expect(component.mode()).toBe('forgot');
  });

  it('não chama login com formulário inválido', async () => {
    await component.entrar();
    expect(authSpy.login).not.toHaveBeenCalled();
  });

  it('chama login com credenciais válidas', async () => {
    authSpy.login.and.resolveTo({} as never);
    component.loginForm.setValue({ email: 'a@b.com', senha: '123456', lembrar: true });

    await component.entrar();

    expect(authSpy.login).toHaveBeenCalledWith('a@b.com', '123456');
  });

  it('exibe erro amigável quando o login falha', async () => {
    authSpy.login.and.rejectWith({ code: 'auth/invalid-credential' });
    component.loginForm.setValue({ email: 'a@b.com', senha: '123456', lembrar: true });

    await component.entrar();

    expect(component.erro()).toBe('E-mail ou senha incorretos.');
    expect(component.loading()).toBeFalse();
  });

  it('recuperar senha leva ao modo sent', async () => {
    authSpy.recuperarSenha.and.resolveTo();
    component.forgotForm.setValue({ email: 'a@b.com' });

    await component.recuperar();

    expect(authSpy.recuperarSenha).toHaveBeenCalledWith('a@b.com');
    expect(component.mode()).toBe('sent');
  });
});
