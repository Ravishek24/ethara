from rest_framework import serializers
from .models import Employee

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ['created_at']

    def validate_email(self, value):
        return value.lower()

    def validate_employee_id(self, value):
        return value.strip().upper()
