import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaEfraPage } from './lista-efra.page';

describe('ListaEfraPage', () => {
  let component: ListaEfraPage;
  let fixture: ComponentFixture<ListaEfraPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ListaEfraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
