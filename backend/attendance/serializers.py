from rest_framework import serializers
from .models import Attendance

class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(
        source='employee.full_name', read_only=True
    )
    employee_id_code = serializers.CharField(
        source='employee.employee_id', read_only=True
    )

    class Meta:
        model = Attendance
        fields = '__all__'

    def validate(self, data):
        # Prevent duplicate attendance for same employee+date on create
        if self.instance is None:
            if Attendance.objects.filter(
                employee=data['employee'],
                date=data['date']
            ).exists():
                raise serializers.ValidationError(
                    "Attendance for this employee on this date already exists."
                )
        return data
