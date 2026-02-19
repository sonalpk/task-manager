import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { Task, PagedResponse } from '../models/task.model';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/api/tasks';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get tasks with default filter', () => {
    const mockResponse: PagedResponse<Task> = {
      content: [{ id: 1, title: 'Test Task', isCompleted: false }],
      page: 0, size: 10, totalElements: 1, totalPages: 1, last: true
    };

    service.getTasks().subscribe(response => {
      expect(response.content.length).toBe(1);
      expect(response.totalElements).toBe(1);
    });

    const req = httpMock.expectOne(r => r.url === apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should create a task via POST', () => {
    const newTask: Task = { title: 'New Task', isCompleted: false };
    const createdTask: Task = { id: 1, ...newTask };

    service.createTask(newTask).subscribe(task => {
      expect(task.id).toBe(1);
      expect(task.title).toBe('New Task');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newTask);
    req.flush(createdTask);
  });

  it('should toggle completion via PATCH', () => {
    const toggled: Task = { id: 1, title: 'Task', isCompleted: true };

    service.toggleCompletion(1).subscribe(task => {
      expect(task.isCompleted).toBeTrue();
    });

    const req = httpMock.expectOne(`${apiUrl}/1/toggle`);
    expect(req.request.method).toBe('PATCH');
    req.flush(toggled);
  });

  it('should delete a task via DELETE', () => {
    service.deleteTask(1).subscribe(res => {
      expect(res).toBeUndefined();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should get task by id', () => {
    const task: Task = { id: 1, title: 'Task', isCompleted: false };

    service.getTaskById(1).subscribe(t => {
      expect(t.id).toBe(1);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(task);
  });
});
