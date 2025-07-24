import math

class MyClass:
    """
    Represents a sample class demonstrating instance, class, and static methods.
    
    Attributes:
        class_variable (int): A class-level variable with a default value of 42.
    
    Methods:
        __init__(self, value):
            Initializes the instance with the provided value.
    
        instance_method(self) -> Any:
            Returns the value stored in the instance.
    
        class_method(cls) -> int:
            Returns the class-level variable.
    
        static_method() -> str:
            Returns a static string message.
    """
    class_variable = 42

    def __init__(self, value):
        """
        Initialize the instance with a given value.
        
        Parameters:
        value (any): The value to be assigned to the instance attribute 'value'.
        """
        self.value = value

    def instance_method(self):
        """
        Return the value stored in the instance.
        
        Returns:
            The value associated with the instance (`self.value`).
        """
        return self.value

    @classmethod
    def class_method(cls):
        return cls.class_variable
    @staticmethod
    def static_method():
        return "This is a static method."

def my_function(param1, param2):
    """def my_function(param1, param2):
        """
        Add two parameters and return the result.
    
        Parameters:
        param1 (any): The first value to add.
        param2 (any): The second value to add.
    
        Returns:
        any: The sum of param1 and param2.
        """
    """
    return param1 + param2

def outer_function():

    """
    Calls and returns the result of an inner function.
    
    Returns:
        str: A greeting string from the inner function.
    """
    def inner_function():
        """
        Return a greeting string from the inner function scope.
        
        Returns:
            str: A greeting message "Hello from the inner function!".
        """
        return "Hello from the inner function!"

    return inner_function()

lambda_with_doc = lambda x: x + 1
lambda_with_doc.__doc__ = "Lambda function docstring."

# Demonstrating docstring on a generator
def my_generator():
    """
    Generator function that yields numbers from 0 up to, but not including, 3.
    """
    yield from range(3)

# Demonstrating docstring on a coroutine (Python 3.5+)
async def my_coroutine():
    """
    Asynchronous coroutine function that returns a greeting string.
    
    Returns:
        str: A greeting message "Hello async".
    """
    return "Hello async"

