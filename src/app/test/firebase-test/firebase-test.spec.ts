import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { FirebaseTestComponent } from './firebase-test';

// Mock Firestore
const mockFirestore = {
  app: { name: 'test-app' }
};

// Mock collection and getDocs functions
const mockCollection = jasmine.createSpy('collection').and.returnValue({});
const mockGetDocs = jasmine.createSpy('getDocs').and.returnValue(Promise.resolve({ size: 0 }));

describe('FirebaseTestComponent', () => {
  let component: FirebaseTestComponent;
  let fixture: ComponentFixture<FirebaseTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirebaseTestComponent],
      providers: [
        { provide: Firestore, useValue: mockFirestore }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirebaseTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty status and not testing', () => {
    expect(component.connectionStatus).toBe('');
    expect(component.errorDetails).toBe('');
    expect(component.testing).toBe(false);
  });

  it('should have test connection button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.test-button');
    expect(button).toBeTruthy();
    expect(button?.textContent?.trim()).toBe('Test Firebase Connection');
  });

  it('should have clear results button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.clear-button');
    expect(button).toBeTruthy();
    expect(button?.textContent?.trim()).toBe('Clear Results');
  });

  it('should disable buttons when testing', () => {
    component.testing = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const testButton = compiled.querySelector('.test-button') as HTMLButtonElement;
    const clearButton = compiled.querySelector('.clear-button') as HTMLButtonElement;

    expect(testButton.disabled).toBe(true);
    expect(clearButton.disabled).toBe(true);
  });

  it('should show testing text when testing is true', () => {
    component.testing = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.test-button');
    expect(button?.textContent?.trim()).toBe('Testing...');
  });

  it('should display success status', () => {
    component.connectionStatus = '✅ Firebase connected successfully!';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const statusElement = compiled.querySelector('.status.success');
    expect(statusElement).toBeTruthy();
    expect(statusElement?.textContent?.trim()).toBe('✅ Firebase connected successfully!');
  });

  it('should display error status', () => {
    component.connectionStatus = '❌ Firebase connection failed';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const statusElement = compiled.querySelector('.status.error');
    expect(statusElement).toBeTruthy();
    expect(statusElement?.textContent?.trim()).toBe('❌ Firebase connection failed');
  });

  it('should display error details when present', () => {
    component.errorDetails = 'Test error details';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const errorElement = compiled.querySelector('.error-details');
    expect(errorElement).toBeTruthy();
    
    const preElement = compiled.querySelector('.error-details pre');
    expect(preElement?.textContent?.trim()).toBe('Test error details');
  });

  it('should clear results when clearResults is called', () => {
    component.connectionStatus = 'Test status';
    component.errorDetails = 'Test error';
    
    component.clearResults();
    
    expect(component.connectionStatus).toBe('');
    expect(component.errorDetails).toBe('');
  });

  it('should set testing to true at start of testConnection', () => {
    spyOn(component, 'testConnection').and.callThrough();
    
    component.testConnection();
    
    expect(component.testing).toBe(true);
  });

  it('should show info section with debug information', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const infoSection = compiled.querySelector('.info-section');
    expect(infoSection).toBeTruthy();
    
    const listItems = compiled.querySelectorAll('.info-section li');
    expect(listItems.length).toBe(3);
  });

  it('should disable clear button when no results to clear', () => {
    component.connectionStatus = '';
    component.errorDetails = '';
    component.testing = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const clearButton = compiled.querySelector('.clear-button') as HTMLButtonElement;
    expect(clearButton.disabled).toBe(true);
  });

  it('should enable clear button when there are results to clear', () => {
    component.connectionStatus = 'Some status';
    component.testing = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const clearButton = compiled.querySelector('.clear-button') as HTMLButtonElement;
    expect(clearButton.disabled).toBe(false);
  });
});