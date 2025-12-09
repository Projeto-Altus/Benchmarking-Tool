class AppError(Exception):
    pass

class InvalidAPIKeyError(AppError):
    pass

class InvalidURLError(AppError):
    pass

class ScrapingTimeoutError(AppError):
    pass