const model = {
  score : 0
}


class Controller {
  constructor(view){
    this.view = view;
    console.log(this.view)
    this.view.on('updateScore', this.updateScore);
  }

  updateScore = () => {
    model.score += 1
    this.view.updateScoreContainer(model.score)
  }

}

export default Controller;