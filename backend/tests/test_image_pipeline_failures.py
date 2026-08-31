import pytest
from fastapi import HTTPException, status

from core.config import settings
from services.ai.pipeline.image_pipeline_service import ImagePipelineService, PipelineResult
from utils.error import codes
from utils.error.error import (
    ReplicateRateLimitError,
    ReplicateTimeoutError,
    ReplicateUnknownError,
)
from utils.error.responses import get_default_message


@pytest.mark.parametrize(
    ("exc", "expected_code", "expected_message"),
    [
        (
            ReplicateRateLimitError(),
            codes.PROVIDER_RATE_LIMITED,
            get_default_message(codes.PROVIDER_RATE_LIMITED),
        ),
        (
            ReplicateTimeoutError(),
            codes.PROVIDER_TIMEOUT,
            get_default_message(codes.PROVIDER_TIMEOUT),
        ),
        (
            ReplicateUnknownError(),
            codes.PROVIDER_FAILED,
            get_default_message(codes.PROVIDER_FAILED),
        ),
        (
            HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"code": codes.INVALID_COLOR_INPUT, "message": "Custom safe message."},
            ),
            codes.INVALID_COLOR_INPUT,
            "Custom safe message.",
        ),
        (
            HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Too big."),
            codes.IMAGE_TOO_LARGE,
            "Too big.",
        ),
        (
            HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Bad type."),
            codes.UNSUPPORTED_FORMAT,
            "Bad type.",
        ),
        (
            HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported format."),
            codes.UNSUPPORTED_FORMAT,
            "Unsupported format.",
        ),
        (
            HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid pixels."),
            codes.INVALID_IMAGE,
            "Invalid pixels.",
        ),
        (
            HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid image."
            ),
            codes.INVALID_IMAGE,
            "Invalid image.",
        ),
        (
            ValueError("Payload exceeds maximum size."),
            codes.UPLOAD_TOO_LARGE,
            f"The uploaded image exceeds the {settings.MAX_FILE_SIZE_MB}MB limit.",
        ),
        (
            ValueError("Image already contains color."),
            codes.INVALID_COLOR_INPUT,
            get_default_message(codes.INVALID_COLOR_INPUT),
        ),
        (
            ValueError("Output exceeds maximum size."),
            codes.OUTPUT_TOO_LARGE,
            get_default_message(codes.OUTPUT_TOO_LARGE),
        ),
        (
            ValueError("Generated image is too large."),
            codes.OUTPUT_TOO_LARGE,
            get_default_message(codes.OUTPUT_TOO_LARGE),
        ),
        (
            ValueError("Image cannot fit within the result cap."),
            codes.OUTPUT_TOO_LARGE,
            get_default_message(codes.OUTPUT_TOO_LARGE),
        ),
        (
            ValueError("Output remains too large."),
            codes.OUTPUT_TOO_LARGE,
            get_default_message(codes.OUTPUT_TOO_LARGE),
        ),
        (
            RuntimeError("Unexpected provider internals."),
            codes.PROCESSING_FAILED,
            get_default_message(codes.PROCESSING_FAILED),
        ),
    ],
)
def test_failure_from_exception_preserves_public_mapping(
    exc: Exception,
    expected_code: str,
    expected_message: str,
) -> None:
    service = object.__new__(ImagePipelineService)

    assert service._failure_from_exception(exc) == PipelineResult.failed(
        expected_code,
        expected_message,
    )
