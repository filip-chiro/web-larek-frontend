import './scss/styles.scss';
import { AppController } from './app.controller';
import { registerDependencies } from './components/features/di/di-setup';
import { inject } from './components/features/di/di-inject';

/**
 * Точка входа в приложение.
 * 
 * Выполняет регистрацию всех зависимостей через функцию `registerDependencies`,
 * затем создаёт и инициализирует главный контроллер приложения `AppController`
 * с помощью DI-контейнера.
 * 
 * Такой подход обеспечивает централизованное управление зависимостями
 * и структурированное начало работы приложения.
 */

registerDependencies();

const appController = inject(AppController);

appController.init();
