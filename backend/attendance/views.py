from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend
from .models import Attendance
from .serializers import AttendanceSerializer

class AttendanceListCreateView(generics.ListCreateAPIView):
    queryset = Attendance.objects.select_related('employee').all()
    serializer_class = AttendanceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee', 'date', 'status']  # bonus: filter by date

class AttendanceByEmployeeView(generics.ListAPIView):
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        employee_id = self.kwargs['employee_id']
        return Attendance.objects.filter(
            employee_id=employee_id
        ).select_related('employee')

