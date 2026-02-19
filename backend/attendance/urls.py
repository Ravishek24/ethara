from django.urls import path
from . import views

urlpatterns = [
    path('', views.AttendanceListCreateView.as_view()),
    path('employee/<int:employee_id>/', views.AttendanceByEmployeeView.as_view()),
]
