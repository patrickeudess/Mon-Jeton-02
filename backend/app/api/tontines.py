from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from .. import models, schemas
from ..auth import get_current_active_user
from ..database import get_db

router = APIRouter()


def user_tontine_query(db: Session, user_id: int):
    return db.query(models.Tontine).options(
        selectinload(models.Tontine.members),
        selectinload(models.Tontine.contributions),
    ).filter(models.Tontine.user_id == user_id)


@router.get("/", response_model=List[schemas.Tontine])
def list_tontines(
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return user_tontine_query(db, current_user.id).order_by(models.Tontine.created_at.desc()).all()


@router.put("/{client_id}", response_model=schemas.Tontine)
def sync_tontine(
    client_id: str,
    payload: schemas.TontineSync,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    if client_id != payload.client_id:
        raise HTTPException(status_code=400, detail="Identifiant de tontine incohérent")
    if payload.type not in {"rotative", "collective"}:
        raise HTTPException(status_code=422, detail="Type de tontine invalide")
    if payload.frequency not in {"hebdomadaire", "mensuelle"}:
        raise HTTPException(status_code=422, detail="Fréquence invalide")
    if payload.amount <= 0 or not payload.members:
        raise HTTPException(status_code=422, detail="Montant et membres requis")

    tontine = user_tontine_query(db, current_user.id).filter(
        models.Tontine.client_id == client_id
    ).first()
    if not tontine:
        tontine = models.Tontine(user_id=current_user.id, client_id=client_id)
        db.add(tontine)

    tontine.name = payload.name.strip()
    tontine.type = payload.type
    tontine.amount = payload.amount
    tontine.frequency = payload.frequency
    tontine.start_date = payload.start_date
    tontine.target = payload.target
    tontine.reminder_enabled = payload.reminder_enabled
    tontine.reminder_days_before = max(0, min(30, payload.reminder_days_before))
    if payload.created_at and not tontine.id:
        tontine.created_at = payload.created_at

    tontine.members.clear()
    tontine.members.extend([
        models.TontineMember(
            client_id=member.client_id,
            name=member.name.strip(),
            is_me=member.is_me,
            position=member.position,
        ) for member in payload.members
    ])
    tontine.contributions.clear()
    tontine.contributions.extend([
        models.TontineContribution(
            member_client_id=item.member_client_id,
            cycle=item.cycle,
            amount=item.amount,
            date=item.date,
        ) for item in payload.contributions
    ])

    db.commit()
    db.refresh(tontine)
    return user_tontine_query(db, current_user.id).filter(models.Tontine.id == tontine.id).first()


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tontine(
    client_id: str,
    current_user: schemas.User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    tontine = user_tontine_query(db, current_user.id).filter(
        models.Tontine.client_id == client_id
    ).first()
    if not tontine:
        raise HTTPException(status_code=404, detail="Tontine non trouvée")
    db.delete(tontine)
    db.commit()
    return None
