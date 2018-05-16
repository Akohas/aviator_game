import model from './model';

class Controller {
  constructor(view){
    this.view = view;

    
    this.view.on('incrementScore', this.incrementScore);
    this.view.on('init', this.setHealth);
    this.view.on('decrementHealth', this.decrementHealth);


    this.setHealth();
  }

  incrementScore = () => {
    model.score += 1
    this.view.updateScore(model.score)
  }

  setHealth = () => {
    console.log('set')
    this.view.updateHealth(model.health)
  }

  decrementHealth = () => {
    if(model.health.current === 1){}
    else{
      model.health.current -= 1;
      this.view.updateHealth(model.health)
    }
  }
}

export default Controller;